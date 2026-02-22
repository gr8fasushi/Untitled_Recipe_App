import { fireEvent, render } from '@testing-library/react-native';
import DisclaimerScreen from './disclaimer';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('DisclaimerScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(<DisclaimerScreen />);
    expect(getByTestId('btn-i-understand')).toBeTruthy();
  });

  it('shows the disclaimer card', () => {
    const { getByTestId } = render(<DisclaimerScreen />);
    expect(getByTestId('disclaimer-card')).toBeTruthy();
  });

  it('shows the progress indicator', () => {
    const { getByTestId } = render(<DisclaimerScreen />);
    expect(getByTestId('progress-indicator')).toBeTruthy();
  });

  it('navigates to allergens on continue press', () => {
    const { getByTestId } = render(<DisclaimerScreen />);
    fireEvent.press(getByTestId('btn-i-understand'));
    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/allergens');
  });
});
