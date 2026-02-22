import { fireEvent, render } from '@testing-library/react-native';
import { act } from '@testing-library/react-native';
import AllergensScreen from './allergens';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('AllergensScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
    act(() => {
      useOnboardingStore.getState().reset();
    });
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(<AllergensScreen />);
    expect(getByTestId('btn-continue-allergens')).toBeTruthy();
  });

  it('shows all 9 allergen cards', () => {
    const { getByTestId } = render(<AllergensScreen />);
    const allergenIds = [
      'milk',
      'eggs',
      'fish',
      'shellfish',
      'tree-nuts',
      'peanuts',
      'wheat',
      'soybeans',
      'sesame',
    ];
    allergenIds.forEach((id) => {
      expect(getByTestId(`card-allergen-${id}`)).toBeTruthy();
    });
  });

  it('shows the progress indicator', () => {
    const { getByTestId } = render(<AllergensScreen />);
    expect(getByTestId('progress-indicator')).toBeTruthy();
  });

  it('shows the None apply to me button', () => {
    const { getByTestId } = render(<AllergensScreen />);
    expect(getByTestId('btn-none-apply')).toBeTruthy();
  });

  it('navigates to dietary screen on continue', () => {
    const { getByTestId } = render(<AllergensScreen />);
    fireEvent.press(getByTestId('btn-continue-allergens'));
    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/dietary');
  });

  it('toggles allergen selection on card press', () => {
    const { getByTestId } = render(<AllergensScreen />);
    fireEvent.press(getByTestId('card-allergen-peanuts'));
    expect(useOnboardingStore.getState().selectedAllergens).toContain('peanuts');
  });

  it('clears all selections when None apply is pressed', () => {
    act(() => {
      useOnboardingStore.getState().toggleAllergen('milk');
      useOnboardingStore.getState().toggleAllergen('eggs');
    });
    const { getByTestId } = render(<AllergensScreen />);
    fireEvent.press(getByTestId('btn-none-apply'));
    expect(useOnboardingStore.getState().selectedAllergens).toHaveLength(0);
  });
});
