import { renderHook } from '@testing-library/react-native';
import { useSubscription } from './useSubscription';

// Mock authStore — factory pattern (hoisted-safe)
let mockProfile: { tier?: string } | null = null;

jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: jest.fn((sel: (s: unknown) => unknown) =>
    sel({ profile: mockProfile, user: null })
  ),
}));

beforeEach(() => {
  mockProfile = null;
});

describe('useSubscription', () => {
  it('returns free tier when profile is null', () => {
    mockProfile = null;
    const { result } = renderHook(() => useSubscription());
    expect(result.current).toEqual({ isPro: false, tier: 'free' });
  });

  it('returns free tier when profile.tier is "free"', () => {
    mockProfile = { tier: 'free' };
    const { result } = renderHook(() => useSubscription());
    expect(result.current).toEqual({ isPro: false, tier: 'free' });
  });

  it('returns pro tier when profile.tier is "pro"', () => {
    mockProfile = { tier: 'pro' };
    const { result } = renderHook(() => useSubscription());
    expect(result.current).toEqual({ isPro: true, tier: 'pro' });
  });

  it('returns free tier when profile.tier is undefined', () => {
    mockProfile = {};
    const { result } = renderHook(() => useSubscription());
    expect(result.current).toEqual({ isPro: false, tier: 'free' });
  });

  it('returns free tier for any unrecognised tier value', () => {
    mockProfile = { tier: 'admin' };
    const { result } = renderHook(() => useSubscription());
    expect(result.current).toEqual({ isPro: false, tier: 'free' });
  });
});
