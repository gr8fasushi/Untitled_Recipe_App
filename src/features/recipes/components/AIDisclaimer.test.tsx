import React from 'react';
import { render } from '@testing-library/react-native';
import { AIDisclaimer } from './AIDisclaimer';

describe('AIDisclaimer', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<AIDisclaimer />);
    expect(getByTestId('ai-disclaimer')).toBeTruthy();
  });

  it('shows the Chef Jules Recipe heading', () => {
    const { getByText } = render(<AIDisclaimer />);
    expect(getByText('Chef Jules Recipe')).toBeTruthy();
  });

  it('shows the informational disclaimer text', () => {
    const { getByText } = render(<AIDisclaimer />);
    expect(getByText(/Recipes are crafted by Chef Jules, your virtual chef/i)).toBeTruthy();
  });

  it('mentions allergen verification', () => {
    const { getByText } = render(<AIDisclaimer />);
    expect(getByText(/Always verify allergen information with product labels/i)).toBeTruthy();
  });

  it('mentions consulting a healthcare provider', () => {
    const { getByText } = render(<AIDisclaimer />);
    expect(getByText(/Consult a healthcare provider for dietary advice/i)).toBeTruthy();
  });
});
