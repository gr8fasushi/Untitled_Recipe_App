import { act, renderHook } from '@testing-library/react-native';
import { updateUserProfile } from '@/features/auth/services/authService';
import { useCompleteOnboarding } from './useCompleteOnboarding';
import { useOnboardingStore } from '../store/onboardingStore';
import { useAuthStore } from '@/features/auth/store/authStore';

// Mock expo-router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Mock authService — fetchUserProfile no longer called after completing onboarding
jest.mock('@/features/auth/services/authService', () => ({
  updateUserProfile: jest.fn(),
}));

const mockUpdateUserProfile = updateUserProfile as jest.Mock;

const mockUser = { uid: 'user-123', email: 'test@example.com' };

const mockProfile = {
  uid: 'user-123',
  email: 'test@example.com',
  displayName: null,
  allergens: [],
  dietaryPreferences: [],
  onboardingComplete: false,
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
    useAuthStore.getState().setUser(mockUser as never);
    useAuthStore.getState().setProfile(mockProfile);

    act(() => {
      useOnboardingStore.getState().toggleAllergen('peanuts');
      useOnboardingStore.getState().toggleAllergen('milk');
      useOnboardingStore.getState().toggleDietaryPreference('vegan');
    });

    mockUpdateUserProfile.mockResolvedValue(undefined);

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

  it('updates auth store directly with onboardingComplete:true after saving', async () => {
    useAuthStore.getState().setUser(mockUser as never);
    useAuthStore.getState().setProfile(mockProfile);

    act(() => {
      useOnboardingStore.getState().toggleAllergen('peanuts');
      useOnboardingStore.getState().toggleDietaryPreference('vegan');
    });

    mockUpdateUserProfile.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCompleteOnboarding());

    await act(async () => {
      await result.current.completeOnboarding();
    });

    const updatedProfile = useAuthStore.getState().profile;
    expect(updatedProfile?.onboardingComplete).toBe(true);
    expect(updatedProfile?.allergens).toEqual(['peanuts']);
    expect(updatedProfile?.dietaryPreferences).toEqual(['vegan']);
  });

  it('navigates to home tab after successful save', async () => {
    useAuthStore.getState().setUser(mockUser as never);
    useAuthStore.getState().setProfile(mockProfile);
    mockUpdateUserProfile.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCompleteOnboarding());

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/home');
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

  it('sets a valid profile (not null) when profile is null in store at completion time', async () => {
    // Reproduces the B1 bug: social auth hook sets profile AFTER onAuthStateChanged fires,
    // leaving profile temporarily null. completeOnboarding must not call setProfile(null).
    useAuthStore.getState().setUser(mockUser as never);
    // Do NOT set profile — leave it null in the store

    act(() => {
      useOnboardingStore.getState().toggleAllergen('eggs');
    });

    mockUpdateUserProfile.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCompleteOnboarding());

    await act(async () => {
      await result.current.completeOnboarding();
    });

    const updatedProfile = useAuthStore.getState().profile;
    expect(updatedProfile).not.toBeNull();
    expect(updatedProfile?.uid).toBe('user-123');
    expect(updatedProfile?.onboardingComplete).toBe(true);
    expect(updatedProfile?.allergens).toEqual(['eggs']);
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/home');
  });

  it('clears error before attempting save', async () => {
    useAuthStore.getState().setUser(mockUser as never);
    useAuthStore.getState().setProfile(mockProfile);

    act(() => {
      useOnboardingStore.getState().setError('previous error');
    });

    mockUpdateUserProfile.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCompleteOnboarding());

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(result.current.error).toBeNull();
  });
});
