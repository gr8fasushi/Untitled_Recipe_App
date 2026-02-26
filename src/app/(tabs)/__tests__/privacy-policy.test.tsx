// ---------------------------------------------------------------------------
// Mocks (must be declared before imports — jest.mock is hoisted)
// ---------------------------------------------------------------------------

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

// eslint-disable-next-line import/first
import React from 'react';
// eslint-disable-next-line import/first
import { render, fireEvent } from '@testing-library/react-native';
// eslint-disable-next-line import/first
import PrivacyPolicyScreen from '../privacy-policy';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PrivacyPolicyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it('renders privacy policy screen', () => {
    const { getByTestId } = render(<PrivacyPolicyScreen />);
    expect(getByTestId('privacy-policy-screen')).toBeTruthy();
  });

  it('renders back button', () => {
    const { getByTestId } = render(<PrivacyPolicyScreen />);
    expect(getByTestId('btn-back')).toBeTruthy();
  });

  it('renders scrollable content area', () => {
    const { getByTestId } = render(<PrivacyPolicyScreen />);
    expect(getByTestId('privacy-policy-content')).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Back navigation
  // -------------------------------------------------------------------------

  it('navigates back when back button is pressed', () => {
    const { getByTestId } = render(<PrivacyPolicyScreen />);
    fireEvent.press(getByTestId('btn-back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Content
  // -------------------------------------------------------------------------

  it('renders Privacy Policy heading', () => {
    const { getAllByText } = render(<PrivacyPolicyScreen />);
    expect(getAllByText('Privacy Policy').length).toBeGreaterThan(0);
  });

  it('renders Data We Collect section', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);
    expect(getByText('Data We Collect')).toBeTruthy();
  });

  it('renders How We Use Your Data section', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);
    expect(getByText('How We Use Your Data')).toBeTruthy();
  });

  it('renders Third-Party Services section', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);
    expect(getByText('Third-Party Services')).toBeTruthy();
  });

  it('renders Data Security section', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);
    expect(getByText('Data Security')).toBeTruthy();
  });

  it('renders Data Retention and Deletion section', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);
    expect(getByText('Data Retention and Deletion')).toBeTruthy();
  });

  it('renders Contact Us section', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);
    expect(getByText('Contact Us')).toBeTruthy();
  });
});
