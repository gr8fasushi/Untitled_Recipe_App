import { fireEvent, render } from '@testing-library/react-native';
import WelcomeScreen from './welcome';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('WelcomeScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(<WelcomeScreen />);
    expect(getByTestId('btn-get-started')).toBeTruthy();
  });

  it('displays the app name', () => {
    const { getByText } = render(<WelcomeScreen />);
    expect(getByText('RecipeApp')).toBeTruthy();
  });

  it('displays the tagline', () => {
    const { getByText } = render(<WelcomeScreen />);
    expect(getByText('Your AI cooking companion')).toBeTruthy();
  });

  it('navigates to disclaimer on Get Started press', () => {
    const { getByTestId } = render(<WelcomeScreen />);
    fireEvent.press(getByTestId('btn-get-started'));
    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/disclaimer');
  });
});
