/**
 * Unit tests for checkDailyLimit middleware.
 *
 * Mocking strategy:
 * - firebase-admin/firestore: expose mock functions via __mocks__ properties
 *   so tests can configure return values via jest.requireMock().
 * - firebase-functions/v2/https: real-shaped HttpsError class.
 */

// ---- Mocks (hoisted) --------------------------------------------------------

jest.mock('firebase-admin/firestore', () => {
  // getUserTier path: db.collection('users').doc(uid).get()
  const mockUserDocGet = jest.fn();

  // checkDailyLimit path: db.collection('dailyLimits').doc(uid).collection(op).doc(today)
  // The ref is just passed to tx.get — we only need it to exist as an object.
  const mockDailyRef = {};

  const mockInnerDoc = jest.fn().mockReturnValue(mockDailyRef);
  const mockInnerCollection = jest.fn().mockReturnValue({ doc: mockInnerDoc });

  const mockShallowDoc = jest.fn().mockReturnValue({
    get: mockUserDocGet,
    collection: mockInnerCollection,
  });

  const mockCollection = jest.fn().mockReturnValue({ doc: mockShallowDoc });

  // Transaction mocks — re-configured in beforeEach per test
  const mockTxGet = jest.fn();
  const mockTxSet = jest.fn();
  const mockRunTransaction = jest.fn(async (cb: (tx: unknown) => Promise<void>) => {
    return cb({ get: mockTxGet, set: mockTxSet });
  });

  const mockDb = {
    collection: mockCollection,
    runTransaction: mockRunTransaction,
  };

  return {
    getFirestore: jest.fn().mockReturnValue(mockDb),
    FieldValue: { increment: jest.fn((n: number) => ({ _increment: n })) },
    // Expose for test access
    _mocks: { mockUserDocGet, mockTxGet, mockTxSet, mockRunTransaction },
  };
});

jest.mock('firebase-functions/v2/https', () => ({
  HttpsError: class HttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
}));

// ---- Imports (after mocks) --------------------------------------------------

import { getUserTier, checkDailyLimit, FREE_CAPS } from './checkDailyLimit';
import { HttpsError } from 'firebase-functions/v2/https';

// Helper to retrieve internal mocks
function getMocks(): {
  mockUserDocGet: jest.Mock;
  mockTxGet: jest.Mock;
  mockTxSet: jest.Mock;
  mockRunTransaction: jest.Mock;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (jest.requireMock('firebase-admin/firestore') as any)._mocks as {
    mockUserDocGet: jest.Mock;
    mockTxGet: jest.Mock;
    mockTxSet: jest.Mock;
    mockRunTransaction: jest.Mock;
  };
}

// ---- Test Suites ------------------------------------------------------------

describe('getUserTier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns "free" when user document does not exist (data undefined)', async () => {
    const { mockUserDocGet } = getMocks();
    mockUserDocGet.mockResolvedValueOnce({ data: () => undefined });

    const result = await getUserTier('uid-123');

    expect(result).toBe('free');
  });

  it('returns "pro" when user tier is "pro"', async () => {
    const { mockUserDocGet } = getMocks();
    mockUserDocGet.mockResolvedValueOnce({ data: () => ({ tier: 'pro' }) });

    const result = await getUserTier('uid-pro');

    expect(result).toBe('pro');
  });

  it('returns "free" when user tier is "free"', async () => {
    const { mockUserDocGet } = getMocks();
    mockUserDocGet.mockResolvedValueOnce({ data: () => ({ tier: 'free' }) });

    const result = await getUserTier('uid-free');

    expect(result).toBe('free');
  });

  it('returns "free" for any unrecognised tier value', async () => {
    const { mockUserDocGet } = getMocks();
    mockUserDocGet.mockResolvedValueOnce({ data: () => ({ tier: 'admin' }) });

    const result = await getUserTier('uid-admin');

    expect(result).toBe('free');
  });
});

describe('checkDailyLimit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves and increments counter when count is 0 (well below cap)', async () => {
    const { mockTxGet, mockTxSet } = getMocks();
    mockTxGet.mockResolvedValueOnce({ data: () => ({ count: 0 }) });

    await expect(checkDailyLimit('uid-123', 'generateRecipe', 5)).resolves.toBeUndefined();

    expect(mockTxSet).toHaveBeenCalledTimes(1);
    const [, payload] = mockTxSet.mock.calls[0] as [unknown, { count: unknown; date: string }];
    expect(payload.count).toEqual({ _increment: 1 }); // FieldValue.increment(1) stub
  });

  it('resolves when count is one below cap (boundary)', async () => {
    const { mockTxGet, mockTxSet } = getMocks();
    mockTxGet.mockResolvedValueOnce({ data: () => ({ count: 4 }) });

    await expect(checkDailyLimit('uid-123', 'generateRecipe', 5)).resolves.toBeUndefined();

    expect(mockTxSet).toHaveBeenCalledTimes(1);
  });

  it('throws HttpsError resource-exhausted with upgrade copy when free cap hit', async () => {
    const { mockTxGet, mockTxSet } = getMocks();
    // count == cap (free cap = 5)
    mockTxGet.mockResolvedValueOnce({ data: () => ({ count: 5 }) });

    let caught: unknown;
    try {
      await checkDailyLimit('uid-123', 'generateRecipe', FREE_CAPS.generateRecipe);
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(HttpsError);
    expect((caught as HttpsError).code).toBe('resource-exhausted');
    expect((caught as HttpsError).message).toContain('Upgrade to Pro');
    expect(mockTxSet).not.toHaveBeenCalled();
  });

  it('throws HttpsError with fair-use copy (not upgrade copy) when pro cap hit', async () => {
    const { mockTxGet } = getMocks();
    // Pro cap for generateRecipe = 50 (> FREE_CAPS.generateRecipe = 5)
    mockTxGet.mockResolvedValueOnce({ data: () => ({ count: 50 }) });

    let caught: unknown;
    try {
      await checkDailyLimit('uid-pro', 'generateRecipe', 50);
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(HttpsError);
    expect((caught as HttpsError).code).toBe('resource-exhausted');
    expect((caught as HttpsError).message).toContain('fair-use');
    expect((caught as HttpsError).message).not.toContain('Upgrade to Pro');
  });

  it('treats missing count field as 0 and resolves', async () => {
    const { mockTxGet, mockTxSet } = getMocks();
    mockTxGet.mockResolvedValueOnce({ data: () => ({}) }); // no count field

    await expect(checkDailyLimit('uid-123', 'analyzePhoto', 3)).resolves.toBeUndefined();

    expect(mockTxSet).toHaveBeenCalledTimes(1);
  });

  it('includes today date string in the tx.set payload', async () => {
    const { mockTxGet, mockTxSet } = getMocks();
    mockTxGet.mockResolvedValueOnce({ data: () => ({ count: 0 }) });

    const today = new Date().toISOString().slice(0, 10);
    await checkDailyLimit('uid-123', 'chatMessages', 5);

    const [, payload] = mockTxSet.mock.calls[0] as [unknown, { count: unknown; date: string }];
    expect(payload.date).toBe(today);
  });
});
