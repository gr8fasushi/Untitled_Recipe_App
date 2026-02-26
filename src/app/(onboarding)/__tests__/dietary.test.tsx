import { fireEvent, render } from '@testing-library/react-native';
import { act } from '@testing-library/react-native';
import DietaryScreen from '../dietary';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
import { useAuthStore } from '@/features/auth/store/authStore';

// Top-level mock object — mutate its properties in individual tests
const mockHookReturn = {
  completeOnboarding: jest.fn(),
  isLoading: false,
  error: null as string | null,
};

jest.mock('@/features/onboarding/hooks/useCompleteOnboarding', () => ({
  useCompleteOnboarding: () => mockHookReturn,
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

describe('DietaryScreen', () => {
  beforeEach(() => {
    mockHookReturn.completeOnboarding.mockClear();
    mockHookReturn.isLoading = false;
    mockHookReturn.error = null;
    act(() => {
      useOnboardingStore.getState().reset();
      useAuthStore.getState().reset();
    });
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(<DietaryScreen />);
    expect(getByTestId('btn-finish-setup')).toBeTruthy();
  });

  it('shows all 9 dietary preference cards', () => {
    const { getByTestId } = render(<DietaryScreen />);
    const prefIds = [
      'vegetarian',
      'vegan',
      'gluten-free',
      'keto',
      'paleo',
      'halal',
      'kosher',
      'low-carb',
      'dairy-free',
    ];
    prefIds.forEach((id) => {
      expect(getByTestId(`card-dietary-${id}`)).toBeTruthy();
    });
  });

  it('shows the progress indicator', () => {
    const { getByTestId } = render(<DietaryScreen />);
    expect(getByTestId('progress-indicator')).toBeTruthy();
  });

  it('calls completeOnboarding on Finish Setup press', () => {
    mockHookReturn.completeOnboarding.mockResolvedValue(undefined);
    const { getByTestId } = render(<DietaryScreen />);
    fireEvent.press(getByTestId('btn-finish-setup'));
    expect(mockHookReturn.completeOnboarding).toHaveBeenCalledTimes(1);
  });

  it('toggles dietary preference on card press', () => {
    const { getByTestId } = render(<DietaryScreen />);
    fireEvent.press(getByTestId('card-dietary-vegan'));
    expect(useOnboardingStore.getState().dietaryPreferences).toContain('vegan');
  });

  it('shows loading indicator when isLoading is true', () => {
    mockHookReturn.isLoading = true;
    const { getByTestId } = render(<DietaryScreen />);
    expect(getByTestId('dietary-loading')).toBeTruthy();
  });

  it('disables the button while loading', () => {
    mockHookReturn.isLoading = true;
    const { getByTestId } = render(<DietaryScreen />);
    expect(getByTestId('btn-finish-setup').props.accessibilityState?.disabled).toBe(true);
  });

  it('shows error message when error is present', () => {
    mockHookReturn.error = 'Failed to save your preferences. Please try again.';
    const { getByTestId, getByText } = render(<DietaryScreen />);
    expect(getByTestId('dietary-error')).toBeTruthy();
    expect(getByText('Failed to save your preferences. Please try again.')).toBeTruthy();
  });

  it('does not show error when error is null', () => {
    mockHookReturn.error = null;
    const { queryByTestId } = render(<DietaryScreen />);
    expect(queryByTestId('dietary-error')).toBeNull();
  });
});
