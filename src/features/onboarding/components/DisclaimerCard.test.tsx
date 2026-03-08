import { render } from '@testing-library/react-native';
import { DisclaimerCard } from './DisclaimerCard';

describe('DisclaimerCard', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<DisclaimerCard />);
    expect(getByTestId('disclaimer-card')).toBeTruthy();
  });

  it('displays the disclaimer heading', () => {
    const { getByText } = render(<DisclaimerCard />);
    expect(getByText('Important Disclaimer')).toBeTruthy();
  });

  it('displays the medical advice warning', () => {
    const { getByText } = render(<DisclaimerCard />);
    expect(getByText('This app is not a substitute for medical advice.')).toBeTruthy();
  });

  it('mentions Chef Jules as an AI virtual chef', () => {
    const { getByText } = render(<DisclaimerCard />);
    expect(getByText(/Chef Jules is an AI virtual chef, not a real person/i)).toBeTruthy();
  });
});
