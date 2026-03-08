import { renderHook, waitFor } from '@testing-library/react-native';
import { useDailyUsage } from './useDailyUsage';
import { FREE_DAILY_CAPS, FREE_SAVE_CAP, PRO_DAILY_CAPS } from '../types';

// ---- Mocks ------------------------------------------------------------------

const mockGetDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
}));

jest.mock('@/shared/services/firebase/firebase.config', () => ({ db: {} }));

let mockIsPro = false;
jest.mock('./useSubscription', () => ({
  useSubscription: jest.fn(() => ({
    isPro: mockIsPro,
    tier: mockIsPro ? 'pro' : 'free',
  })),
}));

let mockUid: string | undefined = 'uid-123';
jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: jest.fn((sel: (s: unknown) => unknown) =>
    sel({ user: mockUid ? { uid: mockUid } : null, profile: null })
  ),
}));

let mockSavedCount = 0;
jest.mock('@/features/saved-recipes/store/savedRecipesStore', () => ({
  useSavedRecipesStore: jest.fn((sel: (s: unknown) => unknown) =>
    sel({ savedRecipes: Array<unknown>(mockSavedCount).fill({}) })
  ),
}));

// Helper: configure Firestore counter responses [recipes, scans, chat]
function mockCounters(recipes: number, scans: number, chat: number): void {
  mockGetDoc
    .mockResolvedValueOnce({ data: () => ({ count: recipes }) })
    .mockResolvedValueOnce({ data: () => ({ count: scans }) })
    .mockResolvedValueOnce({ data: () => ({ count: chat }) });
}

// ---- Tests ------------------------------------------------------------------

beforeEach(() => {
  mockIsPro = false;
  mockUid = 'uid-123';
  mockSavedCount = 0;
  jest.clearAllMocks();
});

describe('useDailyUsage — pro user', () => {
  it('returns unlimited values without calling Firestore', () => {
    mockIsPro = true;

    const { result } = renderHook(() => useDailyUsage());

    expect(mockGetDoc).not.toHaveBeenCalled();
    expect(result.current.recipesMax).toBe(PRO_DAILY_CAPS.generateRecipe);
    expect(result.current.scansMax).toBe(PRO_DAILY_CAPS.analyzePhoto);
    expect(result.current.chatMax).toBe(PRO_DAILY_CAPS.chatMessages);
    expect(result.current.savedMax).toBe(Infinity);
    expect(result.current.recipeCapReached).toBe(false);
    expect(result.current.scanCapReached).toBe(false);
    expect(result.current.chatCapReached).toBe(false);
    expect(result.current.saveCapReached).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useDailyUsage — free user', () => {
  it('calls Firestore 3 times and returns usage=0 when no usage', async () => {
    mockCounters(0, 0, 0);

    const { result } = renderHook(() => useDailyUsage());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetDoc).toHaveBeenCalledTimes(3);
    expect(result.current.recipesUsed).toBe(0);
    expect(result.current.scansUsed).toBe(0);
    expect(result.current.chatUsed).toBe(0);
  });

  it('returns correct partial usage values', async () => {
    mockCounters(3, 1, 4);

    const { result } = renderHook(() => useDailyUsage());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.recipesUsed).toBe(3);
    expect(result.current.scansUsed).toBe(1);
    expect(result.current.chatUsed).toBe(4);
    expect(result.current.recipeCapReached).toBe(false);
    expect(result.current.scanCapReached).toBe(false);
    expect(result.current.chatCapReached).toBe(false);
  });

  it('returns correct max values for free tier', async () => {
    mockCounters(0, 0, 0);

    const { result } = renderHook(() => useDailyUsage());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.recipesMax).toBe(FREE_DAILY_CAPS.generateRecipe);
    expect(result.current.scansMax).toBe(FREE_DAILY_CAPS.analyzePhoto);
    expect(result.current.chatMax).toBe(FREE_DAILY_CAPS.chatMessages);
    expect(result.current.savedMax).toBe(FREE_SAVE_CAP);
  });

  it('sets recipeCapReached=true when recipesUsed equals cap', async () => {
    mockCounters(FREE_DAILY_CAPS.generateRecipe, 0, 0);

    const { result } = renderHook(() => useDailyUsage());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.recipeCapReached).toBe(true);
  });

  it('sets scanCapReached=true when scansUsed equals cap', async () => {
    mockCounters(0, FREE_DAILY_CAPS.analyzePhoto, 0);

    const { result } = renderHook(() => useDailyUsage());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.scanCapReached).toBe(true);
  });

  it('sets chatCapReached=true when chatUsed equals cap', async () => {
    mockCounters(0, 0, FREE_DAILY_CAPS.chatMessages);

    const { result } = renderHook(() => useDailyUsage());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.chatCapReached).toBe(true);
  });

  it('sets saveCapReached=true when savedCount reaches FREE_SAVE_CAP', async () => {
    mockSavedCount = FREE_SAVE_CAP; // 15
    mockCounters(0, 0, 0);

    const { result } = renderHook(() => useDailyUsage());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.savedCount).toBe(FREE_SAVE_CAP);
    expect(result.current.saveCapReached).toBe(true);
  });

  it('sets isLoading=true initially and false after fetch completes', async () => {
    // Delay resolution so we can observe the loading state
    mockGetDoc.mockImplementation(
      () =>
        new Promise<{ data: () => { count: number } }>((resolve) =>
          setTimeout(() => resolve({ data: () => ({ count: 0 }) }), 10)
        )
    );

    const { result } = renderHook(() => useDailyUsage());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('skips Firestore fetch when user is not logged in', () => {
    mockUid = undefined;

    renderHook(() => useDailyUsage());

    expect(mockGetDoc).not.toHaveBeenCalled();
  });
});
