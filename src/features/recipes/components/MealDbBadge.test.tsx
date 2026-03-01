import React from 'react';
import { render } from '@testing-library/react-native';
import { MealDbBadge } from './MealDbBadge';

describe('MealDbBadge', () => {
  it('renders with the correct testID', () => {
    const { getByTestId } = render(<MealDbBadge />);
    expect(getByTestId('mealdb-badge')).toBeTruthy();
  });

  it('displays the TheMealDB label', () => {
    const { getByText } = render(<MealDbBadge />);
    expect(getByText(/TheMealDB Recipe/i)).toBeTruthy();
  });

  it('displays the disclaimer text about nutritional information', () => {
    const { getByText } = render(<MealDbBadge />);
    expect(getByText(/Nutritional information is not available/i)).toBeTruthy();
  });

  it('advises verifying allergen information', () => {
    const { getByText } = render(<MealDbBadge />);
    expect(getByText(/verify allergen information/i)).toBeTruthy();
  });
});
