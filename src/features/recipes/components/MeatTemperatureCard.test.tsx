import { render, screen } from '@testing-library/react-native';
import { MeatTemperatureCard } from './MeatTemperatureCard';
import type { RecipeIngredient } from '@/shared/types';

function ing(name: string): RecipeIngredient {
  return { name, amount: '1', unit: 'lb', optional: false };
}

describe('MeatTemperatureCard', () => {
  it('returns null when no meat ingredients present', () => {
    const { toJSON } = render(
      <MeatTemperatureCard ingredients={[ing('Garlic'), ing('Olive oil')]} />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders the card wrapper when meat is detected', () => {
    render(<MeatTemperatureCard ingredients={[ing('Chicken Breast')]} />);
    expect(screen.getByTestId('meat-temp-card')).toBeTruthy();
  });

  it('shows USDA heading', () => {
    render(<MeatTemperatureCard ingredients={[ing('Salmon fillet')]} />);
    expect(screen.getByText('Safe Internal Temperatures (USDA)')).toBeTruthy();
  });

  it('detects poultry — chicken', () => {
    render(<MeatTemperatureCard ingredients={[ing('Chicken thighs')]} />);
    expect(screen.getByTestId('meat-temp-row-Poultry')).toBeTruthy();
    expect(screen.getByText('165°F / 74°C')).toBeTruthy();
  });

  it('detects poultry — turkey', () => {
    render(<MeatTemperatureCard ingredients={[ing('Turkey breast')]} />);
    expect(screen.getByTestId('meat-temp-row-Poultry')).toBeTruthy();
  });

  it('detects fish & seafood — salmon', () => {
    render(<MeatTemperatureCard ingredients={[ing('Atlantic Salmon')]} />);
    expect(screen.getByTestId('meat-temp-row-Fish & seafood')).toBeTruthy();
    expect(screen.getByText('145°F / 63°C')).toBeTruthy();
  });

  it('detects fish & seafood — shrimp', () => {
    render(<MeatTemperatureCard ingredients={[ing('Large shrimp')]} />);
    expect(screen.getByTestId('meat-temp-row-Fish & seafood')).toBeTruthy();
  });

  it('detects ground meat before generic beef rule', () => {
    render(<MeatTemperatureCard ingredients={[ing('ground beef')]} />);
    expect(screen.getByTestId('meat-temp-row-Ground meat')).toBeTruthy();
    expect(screen.getByText('160°F / 71°C')).toBeTruthy();
    expect(screen.queryByTestId('meat-temp-row-Beef / pork / lamb / veal')).toBeNull();
  });

  it('detects ham with rest note', () => {
    render(<MeatTemperatureCard ingredients={[ing('Glazed ham')]} />);
    expect(screen.getByTestId('meat-temp-row-Ham (raw)')).toBeTruthy();
    expect(screen.getByText(/\+ 3 min rest/)).toBeTruthy();
  });

  it('detects whole beef cuts', () => {
    render(<MeatTemperatureCard ingredients={[ing('Ribeye steak')]} />);
    expect(screen.getByTestId('meat-temp-row-Beef / pork / lamb / veal')).toBeTruthy();
    expect(screen.getByText(/145°F \/ 63°C/)).toBeTruthy();
    expect(screen.getByText(/\+ 3 min rest/)).toBeTruthy();
  });

  it('detects pork chops', () => {
    render(<MeatTemperatureCard ingredients={[ing('Pork chops')]} />);
    expect(screen.getByTestId('meat-temp-row-Beef / pork / lamb / veal')).toBeTruthy();
  });

  it('deduplicates — two chicken ingredients show one Poultry row', () => {
    render(<MeatTemperatureCard ingredients={[ing('Chicken breast'), ing('Chicken thighs')]} />);
    expect(screen.getAllByTestId(/meat-temp-row-Poultry/)).toHaveLength(1);
  });

  it('shows multiple rows for mixed proteins', () => {
    render(<MeatTemperatureCard ingredients={[ing('Chicken breast'), ing('Salmon fillet')]} />);
    expect(screen.getByTestId('meat-temp-row-Poultry')).toBeTruthy();
    expect(screen.getByTestId('meat-temp-row-Fish & seafood')).toBeTruthy();
  });

  it('accepts a custom testID', () => {
    render(<MeatTemperatureCard ingredients={[ing('Tuna steak')]} testID="custom-id" />);
    expect(screen.getByTestId('custom-id')).toBeTruthy();
  });

  it('ignores purely plant-based ingredients', () => {
    render(
      <MeatTemperatureCard
        ingredients={[ing('Tofu'), ing('Bell peppers'), ing('Mushrooms'), ing('Rice')]}
      />
    );
    expect(screen.queryByTestId('meat-temp-card')).toBeNull();
  });

  describe('steak doneness chart', () => {
    it('shows doneness chart when recipe title contains "steak"', () => {
      render(
        <MeatTemperatureCard
          ingredients={[ing('Ribeye'), ing('Butter')]}
          recipeTitle="Pan-Seared Ribeye Steak"
        />
      );
      expect(screen.getByTestId('steak-doneness-card')).toBeTruthy();
    });

    it('shows doneness chart when ingredient is ribeye', () => {
      render(
        <MeatTemperatureCard ingredients={[ing('Ribeye steak')]} recipeTitle="Grilled Beef" />
      );
      expect(screen.getByTestId('steak-doneness-card')).toBeTruthy();
    });

    it('shows all 5 doneness levels', () => {
      render(
        <MeatTemperatureCard ingredients={[ing('Sirloin steak')]} recipeTitle="Sirloin Steak" />
      );
      expect(screen.getByTestId('steak-row-rare')).toBeTruthy();
      expect(screen.getByTestId('steak-row-medium-rare')).toBeTruthy();
      expect(screen.getByTestId('steak-row-medium')).toBeTruthy();
      expect(screen.getByTestId('steak-row-medium-well')).toBeTruthy();
      expect(screen.getByTestId('steak-row-well-done')).toBeTruthy();
    });

    it('does NOT show doneness chart for chicken recipe', () => {
      render(
        <MeatTemperatureCard ingredients={[ing('Chicken breast')]} recipeTitle="Roasted Chicken" />
      );
      expect(screen.queryByTestId('steak-doneness-card')).toBeNull();
    });

    it('shows both USDA card and doneness chart for a steak recipe', () => {
      render(
        <MeatTemperatureCard ingredients={[ing('Ribeye steak')]} recipeTitle="Ribeye Steak" />
      );
      expect(screen.getByTestId('meat-temp-card')).toBeTruthy();
      expect(screen.getByTestId('steak-doneness-card')).toBeTruthy();
    });

    it('returns null when no meat and no steak keywords', () => {
      const { toJSON } = render(
        <MeatTemperatureCard
          ingredients={[ing('Pasta'), ing('Tomato sauce')]}
          recipeTitle="Pasta Primavera"
        />
      );
      expect(toJSON()).toBeNull();
    });
  });
});
