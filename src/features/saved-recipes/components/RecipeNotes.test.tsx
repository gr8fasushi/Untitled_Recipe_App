import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RecipeNotes } from './RecipeNotes';
import { MAX_NOTES_LENGTH } from '../types';

describe('RecipeNotes', () => {
  it('renders with the default testID', () => {
    const { getByTestId } = render(<RecipeNotes notes="" onNotesChange={jest.fn()} />);
    expect(getByTestId('recipe-notes')).toBeTruthy();
    expect(getByTestId('recipe-notes-input')).toBeTruthy();
  });

  it('renders with a custom testID', () => {
    const { getByTestId } = render(
      <RecipeNotes notes="" onNotesChange={jest.fn()} testID="my-notes" />
    );
    expect(getByTestId('my-notes')).toBeTruthy();
    expect(getByTestId('my-notes-input')).toBeTruthy();
  });

  it('displays the current notes value', () => {
    const { getByDisplayValue } = render(
      <RecipeNotes notes="Great recipe!" onNotesChange={jest.fn()} />
    );
    expect(getByDisplayValue('Great recipe!')).toBeTruthy();
  });

  it('calls onNotesChange when text changes', () => {
    const onNotesChange = jest.fn();
    const { getByTestId } = render(<RecipeNotes notes="" onNotesChange={onNotesChange} />);
    fireEvent.changeText(getByTestId('recipe-notes-input'), 'New note');
    expect(onNotesChange).toHaveBeenCalledWith('New note');
  });

  it('shows character counter', () => {
    const { getByText } = render(<RecipeNotes notes="Hi" onNotesChange={jest.fn()} />);
    expect(getByText(`2/${MAX_NOTES_LENGTH}`)).toBeTruthy();
  });

  it('does not call onNotesChange when text exceeds max length', () => {
    const onNotesChange = jest.fn();
    const { getByTestId } = render(<RecipeNotes notes="existing" onNotesChange={onNotesChange} />);
    const overLimit = 'a'.repeat(MAX_NOTES_LENGTH + 1);
    fireEvent.changeText(getByTestId('recipe-notes-input'), overLimit);
    expect(onNotesChange).not.toHaveBeenCalled();
  });

  it('shows placeholder text', () => {
    const { getByPlaceholderText } = render(<RecipeNotes notes="" onNotesChange={jest.fn()} />);
    expect(getByPlaceholderText('Add cooking notes…')).toBeTruthy();
  });
});
