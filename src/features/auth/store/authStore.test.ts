import { useAuthStore } from './authStore';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/shared/types';

// firebase/auth types are only used for type annotations — mock the module
jest.mock('firebase/auth', () => ({}));

const mockUser = { uid: 'user-1', email: 'test@example.com' } as unknown as User;

const mockProfile: UserProfile = {
  uid: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  allergens: [],
  dietaryPreferences: [],
  onboardingComplete: false,
  createdAt: new Date('2026-01-01'),
};

beforeEach(() => {
  useAuthStore.setState({
    isInitialized: false,
    user: null,
    profile: null,
    isLoading: false,
    error: null,
  });
});

describe('setInitialized', () => {
  it('sets isInitialized to true', () => {
    useAuthStore.getState().setInitialized(true);
    expect(useAuthStore.getState().isInitialized).toBe(true);
  });

  it('sets isInitialized to false', () => {
    useAuthStore.setState({ isInitialized: true });
    useAuthStore.getState().setInitialized(false);
    expect(useAuthStore.getState().isInitialized).toBe(false);
  });
});

describe('setUser', () => {
  it('stores the Firebase User object', () => {
    useAuthStore.getState().setUser(mockUser);
    expect(useAuthStore.getState().user).toBe(mockUser);
  });

  it('clears user when set to null', () => {
    useAuthStore.setState({ user: mockUser });
    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('setProfile', () => {
  it('stores the UserProfile', () => {
    useAuthStore.getState().setProfile(mockProfile);
    expect(useAuthStore.getState().profile).toEqual(mockProfile);
  });

  it('clears profile when set to null', () => {
    useAuthStore.setState({ profile: mockProfile });
    useAuthStore.getState().setProfile(null);
    expect(useAuthStore.getState().profile).toBeNull();
  });
});

describe('setLoading', () => {
  it('sets isLoading to true', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
  });

  it('sets isLoading to false', () => {
    useAuthStore.setState({ isLoading: true });
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

describe('setError', () => {
  it('stores an error message', () => {
    useAuthStore.getState().setError('Something went wrong.');
    expect(useAuthStore.getState().error).toBe('Something went wrong.');
  });

  it('clears error when set to null', () => {
    useAuthStore.setState({ error: 'old error' });
    useAuthStore.getState().setError(null);
    expect(useAuthStore.getState().error).toBeNull();
  });
});

describe('reset', () => {
  it('returns ALL fields to initial values', () => {
    useAuthStore.setState({
      isInitialized: true,
      user: mockUser,
      profile: mockProfile,
      isLoading: true,
      error: 'some error',
    });

    useAuthStore.getState().reset();

    const state = useAuthStore.getState();
    expect(state.isInitialized).toBe(false);
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});
