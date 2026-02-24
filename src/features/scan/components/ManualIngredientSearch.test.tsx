import { render, fireEvent } from '@testing-library/react-native';
import { ManualIngredientSearch } from './ManualIngredientSearch';

// searchIngredients returns items matching the query from the local INGREDIENTS constant
// We mock it to control test data precisely
jest.mock('@/constants/ingredients', () => ({
  searchIngredients: jest.fn((query: string) => {
    const all = [
      { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'vegetable' },
      { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'vegetable' },
      { id: 'broccoli', name: 'Broccoli', emoji: '🥦', category: 'vegetable' },
    ];
    if (!query) return all;
    return all.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));
  }),
}));

const carrot = { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'vegetable' };

describe('ManualIngredientSearch', () => {
  it('renders the text input', () => {
    const { getByTestId } = render(<ManualIngredientSearch onAdd={jest.fn()} alreadyAdded={[]} />);
    expect(getByTestId('manual-search-input')).toBeTruthy();
  });

  it('shows no results when query is empty', () => {
    const { queryByTestId } = render(
      <ManualIngredientSearch onAdd={jest.fn()} alreadyAdded={[]} />
    );
    expect(queryByTestId('manual-result-carrot')).toBeNull();
  });

  it('shows matching results as user types', () => {
    const { getByTestId } = render(<ManualIngredientSearch onAdd={jest.fn()} alreadyAdded={[]} />);
    fireEvent.changeText(getByTestId('manual-search-input'), 'carr');
    expect(getByTestId('manual-result-carrot')).toBeTruthy();
  });

  it('shows multiple matching results', () => {
    const { getByTestId } = render(<ManualIngredientSearch onAdd={jest.fn()} alreadyAdded={[]} />);
    fireEvent.changeText(getByTestId('manual-search-input'), 'o');
    // 'Carrot' and 'Broccoli' both contain 'o'; 'Tomato' contains 'o' too
    expect(getByTestId('manual-result-carrot')).toBeTruthy();
    expect(getByTestId('manual-result-tomato')).toBeTruthy();
  });

  it('calls onAdd with the selected ingredient', () => {
    const onAdd = jest.fn();
    const { getByTestId } = render(<ManualIngredientSearch onAdd={onAdd} alreadyAdded={[]} />);
    fireEvent.changeText(getByTestId('manual-search-input'), 'carr');
    fireEvent.press(getByTestId('manual-result-carrot'));
    expect(onAdd).toHaveBeenCalledWith(carrot);
  });

  it('clears the input after a selection', () => {
    const { getByTestId } = render(<ManualIngredientSearch onAdd={jest.fn()} alreadyAdded={[]} />);
    fireEvent.changeText(getByTestId('manual-search-input'), 'carr');
    fireEvent.press(getByTestId('manual-result-carrot'));
    expect(getByTestId('manual-search-input').props.value).toBe('');
  });

  it('hides results after a selection', () => {
    const { getByTestId, queryByTestId } = render(
      <ManualIngredientSearch onAdd={jest.fn()} alreadyAdded={[]} />
    );
    fireEvent.changeText(getByTestId('manual-search-input'), 'carr');
    fireEvent.press(getByTestId('manual-result-carrot'));
    expect(queryByTestId('manual-result-carrot')).toBeNull();
  });

  it('shows checkmark for already-added ingredients', () => {
    const { getByTestId } = render(
      <ManualIngredientSearch onAdd={jest.fn()} alreadyAdded={[carrot]} />
    );
    fireEvent.changeText(getByTestId('manual-search-input'), 'carr');
    expect(getByTestId('manual-result-carrot-check')).toBeTruthy();
  });

  it('does not call onAdd when tapping an already-added ingredient', () => {
    const onAdd = jest.fn();
    const { getByTestId } = render(
      <ManualIngredientSearch onAdd={onAdd} alreadyAdded={[carrot]} />
    );
    fireEvent.changeText(getByTestId('manual-search-input'), 'carr');
    fireEvent.press(getByTestId('manual-result-carrot'));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not show checkmark for ingredients not yet added', () => {
    const { getByTestId, queryByTestId } = render(
      <ManualIngredientSearch onAdd={jest.fn()} alreadyAdded={[]} />
    );
    fireEvent.changeText(getByTestId('manual-search-input'), 'carr');
    expect(queryByTestId('manual-result-carrot-check')).toBeNull();
    expect(getByTestId('manual-result-carrot')).toBeTruthy();
  });
});
