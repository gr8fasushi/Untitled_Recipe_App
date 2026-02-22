import { fireEvent, render } from '@testing-library/react-native';
import { AllergenCard } from './AllergenCard';
import type { Allergen } from '@/constants/allergens';

const mockAllergen: Allergen = {
  id: 'peanuts',
  name: 'Peanuts',
  icon: '🥜',
  description: 'Peanuts and peanut-derived products',
};

describe('AllergenCard', () => {
  it('renders allergen name, icon, and description', () => {
    const { getByText } = render(
      <AllergenCard
        allergen={mockAllergen}
        isSelected={false}
        onToggle={() => undefined}
        testID="card-peanuts"
      />
    );
    expect(getByText('Peanuts')).toBeTruthy();
    expect(getByText('🥜')).toBeTruthy();
    expect(getByText('Peanuts and peanut-derived products')).toBeTruthy();
  });

  it('calls onToggle when pressed', () => {
    const onToggle = jest.fn();
    const { getByTestId } = render(
      <AllergenCard
        allergen={mockAllergen}
        isSelected={false}
        onToggle={onToggle}
        testID="card-peanuts"
      />
    );
    fireEvent.press(getByTestId('card-peanuts'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows checkmark when selected', () => {
    const { getByText } = render(
      <AllergenCard
        allergen={mockAllergen}
        isSelected={true}
        onToggle={() => undefined}
        testID="card-peanuts"
      />
    );
    expect(getByText('✓')).toBeTruthy();
  });

  it('does not show checkmark when not selected', () => {
    const { queryByText } = render(
      <AllergenCard
        allergen={mockAllergen}
        isSelected={false}
        onToggle={() => undefined}
        testID="card-peanuts"
      />
    );
    expect(queryByText('✓')).toBeNull();
  });

  it('has correct accessibility attributes when selected', () => {
    const { getByTestId } = render(
      <AllergenCard
        allergen={mockAllergen}
        isSelected={true}
        onToggle={() => undefined}
        testID="card-peanuts"
      />
    );
    const card = getByTestId('card-peanuts');
    expect(card.props.accessibilityState).toEqual({ checked: true });
  });

  it('has correct accessibility attributes when not selected', () => {
    const { getByTestId } = render(
      <AllergenCard
        allergen={mockAllergen}
        isSelected={false}
        onToggle={() => undefined}
        testID="card-peanuts"
      />
    );
    const card = getByTestId('card-peanuts');
    expect(card.props.accessibilityState).toEqual({ checked: false });
  });
});
