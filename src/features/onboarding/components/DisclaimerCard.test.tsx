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

  it('mentions AI-generated content', () => {
    const { getByText } = render(<DisclaimerCard />);
    expect(getByText(/RecipeApp uses AI to generate recipes/i)).toBeTruthy();
  });
});
