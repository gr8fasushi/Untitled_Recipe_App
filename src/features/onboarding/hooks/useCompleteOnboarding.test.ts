import { act, renderHook } from '@testing-library/react-native';
import { fetchUserProfile, updateUserProfile } from '@/features/auth/services/authService';
import { useCompleteOnboarding } from './useCompleteOnboarding';
import { useOnboardingStore } from '../store/onboardingStore';
import { useAuthStore } from '@/features/auth/store/authStore';

// Mock expo-router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Mock authService
jest.mock('@/features/auth/services/authService', () => ({
  updateUserProfile: jest.fn(),
  fetchUserProfile: jest.fn(),
}));

const mockUpdateUserProfile = updateUserProfile as jest.Mock;
const mockFetchUserProfile = fetchUserProfile as jest.Mock;

const mockUser = { uid: 'user-123', email: 'test@example.com' };

const mockProfile = {
  uid: 'user-123',
  email: 'test@example.com',
  displayName: null,
  allergens: ['peanuts', 'milk'],
  dietaryPreferences: ['vegan'],
  onboardingComplete: true,
  createdAt: new Date(),
};

describe('useCompleteOnboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockClear();
    // Reset stores
    useOnboardingStore.getState().reset();
    useAuthStore.getState().reset();
  });

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useCompleteOnboarding());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.completeOnboarding).toBe('function');
  });

  it('sets error when user is not signed in', async () => {
    // No user in store (default)
    const { result } = renderHook(() => useCompleteOnboarding());

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(result.current.error).toBe('You must be signed in to complete onboarding.');
    expect(mockUpdateUserProfile).not.toHaveBeenCalled();
  });

  it('calls updateUserProfile with correct data', async () => {
    // Set up user in auth store
    useAuthStore.getState().setUser(mockUser as never);

    // Set up selections in onboarding store
    act(() => {
      useOnboardingStore.getState().toggleAllergen('peanuts');
      useOnboardingStore.getState().toggleAllergen('milk');
      useOnboardingStore.getState().toggleDietaryPreference('vegan');
    });

    mockUpdateUserProfile.mockResolvedValue(undefined);
    mockFetchUserProfile.mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useCompleteOnboarding());

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(mockUpdateUserProfile).toHaveBeenCalledWith('user-123', {
      allergens: ['peanuts', 'milk'],
      dietaryPreferences: ['vegan'],
      onboardingComplete: true,
    });
  });

  it('fetches fresh profile and updates auth store after saving', async () => {
    useAuthStore.getState().setUser(mockUser as never);
    mockUpdateUserProfile.mockResolvedValue(undefined);
    mockFetchUserProfile.mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useCompleteOnboarding());

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(mockFetchUserProfile).toHaveBeenCalledWith('user-123');
    expect(useAuthStore.getState().profile).toEqual(mockProfile);
  });

  it('navigates to root after successful save', async () => {
    useAuthStore.getState().setUser(mockUser as never);
    mockUpdateUserProfile.mockResolvedValue(undefined);
    mockFetchUserProfile.mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useCompleteOnboarding());

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('sets error and clears loading on failure', async () => {
    useAuthStore.getState().setUser(mockUser as never);
    mockUpdateUserProfile.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCompleteOnboarding());

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(result.current.error).toBe('Failed to save your preferences. Please try again.');
    expect(result.current.isLoading).toBe(false);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('clears error before attempting save', async () => {
    useAuthStore.getState().setUser(mockUser as never);
    // Pre-set an error
    act(() => {
      useOnboardingStore.getState().setError('previous error');
    });

    mockUpdateUserProfile.mockResolvedValue(undefined);
    mockFetchUserProfile.mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useCompleteOnboarding());

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(result.current.error).toBeNull();
  });
});
