import { render, fireEvent } from '@testing-library/react-native';
import { ScanResultCard } from './ScanResultCard';

const carrot = { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'vegetable' };
const noEmoji = { id: 'salt', name: 'Salt' };

describe('ScanResultCard', () => {
  it('renders ingredient name', () => {
    const { getByTestId } = render(<ScanResultCard ingredient={carrot} onRemove={jest.fn()} />);
    expect(getByTestId('scan-result-carrot-name').props.children).toBe('Carrot');
  });

  it('renders emoji when present', () => {
    const { getByText } = render(<ScanResultCard ingredient={carrot} onRemove={jest.fn()} />);
    expect(getByText('🥕')).toBeTruthy();
  });

  it('renders without emoji when absent', () => {
    const { getByTestId, queryByText } = render(
      <ScanResultCard ingredient={noEmoji} onRemove={jest.fn()} />
    );
    expect(getByTestId('scan-result-salt-name').props.children).toBe('Salt');
    expect(queryByText('🥕')).toBeNull();
  });

  it('uses default testID based on ingredient id', () => {
    const { getByTestId } = render(<ScanResultCard ingredient={carrot} onRemove={jest.fn()} />);
    expect(getByTestId('scan-result-carrot')).toBeTruthy();
  });

  it('uses custom testID when provided', () => {
    const { getByTestId } = render(
      <ScanResultCard ingredient={carrot} onRemove={jest.fn()} testID="my-card" />
    );
    expect(getByTestId('my-card')).toBeTruthy();
    expect(getByTestId('my-card-name')).toBeTruthy();
    expect(getByTestId('my-card-remove')).toBeTruthy();
  });

  it('calls onRemove when remove button is pressed', () => {
    const onRemove = jest.fn();
    const { getByTestId } = render(<ScanResultCard ingredient={carrot} onRemove={onRemove} />);
    fireEvent.press(getByTestId('scan-result-carrot-remove'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('remove button has correct accessibilityLabel', () => {
    const { getByTestId } = render(<ScanResultCard ingredient={carrot} onRemove={jest.fn()} />);
    expect(getByTestId('scan-result-carrot-remove').props.accessibilityLabel).toBe('Remove Carrot');
  });
});
