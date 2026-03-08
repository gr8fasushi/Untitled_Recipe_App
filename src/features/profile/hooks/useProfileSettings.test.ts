import type { UserProfile } from '@/shared/types';

// ---------------------------------------------------------------------------
// Mocks (must be declared before imports)
// ---------------------------------------------------------------------------
const mockUpdateUserProfile = jest.fn().mockResolvedValue(undefined);
const mockFetchUserProfile = jest.fn();
const mockSignOutUser = jest.fn().mockResolvedValue(undefined);

jest.mock('@/features/auth/services/authService', () => ({
  updateUserProfile: (...args: unknown[]) => mockUpdateUserProfile(...args),
  fetchUserProfile: (...args: unknown[]) => mockFetchUserProfile(...args),
  signOutUser: (...args: unknown[]) => mockSignOutUser(...args),
}));

const mockSetProfile = jest.fn();

let mockProfile: UserProfile = {
  uid: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  allergens: ['milk'],
  dietaryPreferences: ['vegan'],
  onboardingComplete: true,
  createdAt: new Date(),
  tier: 'free',
};

const mockUser = { uid: 'user-1' };

jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: (sel: (s: unknown) => unknown) =>
    sel({
      profile: mockProfile,
      user: mockUser,
      setProfile: mockSetProfile,
    }),
}));

// eslint-disable-next-line import/first
import { renderHook, act } from '@testing-library/react-native';
// eslint-disable-next-line import/first
import { useProfileSettings } from './useProfileSettings';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useProfileSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProfile = {
      uid: 'user-1',
      email: 'test@example.com',
      displayName: 'Test User',
      allergens: ['milk'],
      dietaryPreferences: ['vegan'],
      onboardingComplete: true,
      createdAt: new Date(),
      tier: 'free',
    };
    mockFetchUserProfile.mockResolvedValue(mockProfile);
  });

  it('initializes displayName from profile', () => {
    const { result } = renderHook(() => useProfileSettings());
    expect(result.current.displayName).toBe('Test User');
  });

  it('initializes email from profile', () => {
    const { result } = renderHook(() => useProfileSettings());
    expect(result.current.email).toBe('test@example.com');
  });

  it('initializes selectedAllergens from profile', () => {
    const { result } = renderHook(() => useProfileSettings());
    expect(result.current.selectedAllergens).toEqual(['milk']);
  });

  it('initializes selectedDietaryPreferences from profile', () => {
    const { result } = renderHook(() => useProfileSettings());
    expect(result.current.selectedDietaryPreferences).toEqual(['vegan']);
  });

  it('hasChanges is false on init', () => {
    const { result } = renderHook(() => useProfileSettings());
    expect(result.current.hasChanges).toBe(false);
  });

  it('hasChanges becomes true when displayName changes', () => {
    const { result } = renderHook(() => useProfileSettings());
    act(() => {
      result.current.setDisplayName('New Name');
    });
    expect(result.current.hasChanges).toBe(true);
  });

  it('toggleAllergen adds id when not present', () => {
    const { result } = renderHook(() => useProfileSettings());
    act(() => {
      result.current.toggleAllergen('eggs');
    });
    expect(result.current.selectedAllergens).toContain('eggs');
    expect(result.current.hasChanges).toBe(true);
  });

  it('toggleAllergen removes id when already present', () => {
    const { result } = renderHook(() => useProfileSettings());
    act(() => {
      result.current.toggleAllergen('milk');
    });
    expect(result.current.selectedAllergens).not.toContain('milk');
    expect(result.current.hasChanges).toBe(true);
  });

  it('toggleDietaryPreference adds id when not present', () => {
    const { result } = renderHook(() => useProfileSettings());
    act(() => {
      result.current.toggleDietaryPreference('keto');
    });
    expect(result.current.selectedDietaryPreferences).toContain('keto');
  });

  it('toggleDietaryPreference removes id when already present', () => {
    const { result } = renderHook(() => useProfileSettings());
    act(() => {
      result.current.toggleDietaryPreference('vegan');
    });
    expect(result.current.selectedDietaryPreferences).not.toContain('vegan');
  });

  it('saveChanges calls updateUserProfile with correct args', async () => {
    const { result } = renderHook(() => useProfileSettings());
    await act(async () => {
      await result.current.saveChanges();
    });
    expect(mockUpdateUserProfile).toHaveBeenCalledWith('user-1', {
      displayName: 'Test User',
      allergens: ['milk'],
      dietaryPreferences: ['vegan'],
    });
  });

  it('saveChanges fetches fresh profile and calls setProfile', async () => {
    const fresh = { ...mockProfile, displayName: 'Updated' };
    mockFetchUserProfile.mockResolvedValueOnce(fresh);
    const { result } = renderHook(() => useProfileSettings());
    await act(async () => {
      await result.current.saveChanges();
    });
    expect(mockFetchUserProfile).toHaveBeenCalledWith('user-1');
    expect(mockSetProfile).toHaveBeenCalledWith(fresh);
  });

  it('saveChanges clears isLoading after completion', async () => {
    const { result } = renderHook(() => useProfileSettings());
    await act(async () => {
      await result.current.saveChanges();
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('saveChanges sets error when updateUserProfile throws', async () => {
    mockUpdateUserProfile.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useProfileSettings());
    await act(async () => {
      await result.current.saveChanges();
    });
    expect(result.current.error).toBe('Network error');
    expect(result.current.isLoading).toBe(false);
  });

  it('saveChanges sets error when displayName is empty', async () => {
    const { result } = renderHook(() => useProfileSettings());
    act(() => {
      result.current.setDisplayName('');
    });
    await act(async () => {
      await result.current.saveChanges();
    });
    expect(mockUpdateUserProfile).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Display name cannot be empty.');
  });

  it('resetChanges restores profile values and clears hasChanges', () => {
    const { result } = renderHook(() => useProfileSettings());
    act(() => {
      result.current.setDisplayName('Changed');
      result.current.toggleAllergen('eggs');
    });
    act(() => {
      result.current.resetChanges();
    });
    expect(result.current.displayName).toBe('Test User');
    expect(result.current.selectedAllergens).toEqual(['milk']);
    expect(result.current.hasChanges).toBe(false);
  });

  it('signOut calls signOutUser', async () => {
    const { result } = renderHook(() => useProfileSettings());
    await act(async () => {
      await result.current.signOut();
    });
    expect(mockSignOutUser).toHaveBeenCalled();
  });

  it('signOut sets error when signOutUser throws', async () => {
    mockSignOutUser.mockRejectedValueOnce(new Error('Sign out failed'));
    const { result } = renderHook(() => useProfileSettings());
    await act(async () => {
      await result.current.signOut();
    });
    expect(result.current.error).toBe('Sign out failed');
  });
});
