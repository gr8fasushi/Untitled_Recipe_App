import { fireEvent, render } from '@testing-library/react-native';
import { DietaryPreferenceCard } from './DietaryPreferenceCard';

const mockPreference = {
  id: 'vegan',
  name: 'Vegan',
  icon: '🌱',
};

describe('DietaryPreferenceCard', () => {
  it('renders preference name and icon', () => {
    const { getByText } = render(
      <DietaryPreferenceCard
        preference={mockPreference}
        isSelected={false}
        onToggle={() => undefined}
        testID="card-vegan"
      />
    );
    expect(getByText('Vegan')).toBeTruthy();
    expect(getByText('🌱')).toBeTruthy();
  });

  it('calls onToggle when pressed', () => {
    const onToggle = jest.fn();
    const { getByTestId } = render(
      <DietaryPreferenceCard
        preference={mockPreference}
        isSelected={false}
        onToggle={onToggle}
        testID="card-vegan"
      />
    );
    fireEvent.press(getByTestId('card-vegan'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows checkmark when selected', () => {
    const { getByText } = render(
      <DietaryPreferenceCard
        preference={mockPreference}
        isSelected={true}
        onToggle={() => undefined}
        testID="card-vegan"
      />
    );
    expect(getByText('✓')).toBeTruthy();
  });

  it('does not show checkmark when not selected', () => {
    const { queryByText } = render(
      <DietaryPreferenceCard
        preference={mockPreference}
        isSelected={false}
        onToggle={() => undefined}
        testID="card-vegan"
      />
    );
    expect(queryByText('✓')).toBeNull();
  });

  it('has correct accessibility state when selected', () => {
    const { getByTestId } = render(
      <DietaryPreferenceCard
        preference={mockPreference}
        isSelected={true}
        onToggle={() => undefined}
        testID="card-vegan"
      />
    );
    expect(getByTestId('card-vegan').props.accessibilityState).toEqual({ checked: true });
  });

  it('has correct accessibility state when not selected', () => {
    const { getByTestId } = render(
      <DietaryPreferenceCard
        preference={mockPreference}
        isSelected={false}
        onToggle={() => undefined}
        testID="card-vegan"
      />
    );
    expect(getByTestId('card-vegan').props.accessibilityState).toEqual({ checked: false });
  });
});
