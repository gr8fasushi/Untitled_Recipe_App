// ---------------------------------------------------------------------------
// Mocks (must be declared before imports)
// ---------------------------------------------------------------------------
const mockSaveChanges = jest.fn().mockResolvedValue(undefined);
const mockSignOut = jest.fn().mockResolvedValue(undefined);
const mockSetDisplayName = jest.fn();
const mockToggleAllergen = jest.fn();
const mockToggleDietaryPreference = jest.fn();
const mockResetChanges = jest.fn();

let mockHookReturn = {
  email: 'test@example.com',
  displayName: 'Test User',
  selectedAllergens: ['milk'] as string[],
  selectedDietaryPreferences: ['vegan'] as string[],
  isLoading: false,
  error: null as string | null,
  hasChanges: false,
  setDisplayName: mockSetDisplayName,
  toggleAllergen: mockToggleAllergen,
  toggleDietaryPreference: mockToggleDietaryPreference,
  saveChanges: mockSaveChanges,
  resetChanges: mockResetChanges,
  signOut: mockSignOut,
};

jest.mock('@/features/profile/hooks/useProfileSettings', () => ({
  useProfileSettings: () => mockHookReturn,
}));

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '2.0.0' } },
}));

jest.mock('@/shared/components/ui/Button', () => ({
  Button: ({
    label,
    onPress,
    disabled,
    testID,
  }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    testID?: string;
    variant?: string;
  }) => {
    const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <Pressable testID={testID} onPress={onPress} accessibilityState={{ disabled: !!disabled }}>
        <Text>{label}</Text>
      </Pressable>
    );
  },
}));

jest.mock('@/shared/components/ui/Input', () => ({
  Input: ({
    testID,
    value,
    onChangeText,
    editable,
    label,
  }: {
    testID?: string;
    value: string;
    onChangeText?: (text: string) => void;
    editable?: boolean;
    label?: string;
    autoCapitalize?: string;
    keyboardType?: string;
  }) => {
    const { TextInput, Text, View } =
      jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <View>
        {label ? <Text>{label}</Text> : null}
        <TextInput testID={testID} value={value} onChangeText={onChangeText} editable={editable} />
      </View>
    );
  },
}));

jest.mock('@/features/onboarding/components/AllergenCard', () => ({
  AllergenCard: ({
    testID,
    isSelected,
    onToggle,
  }: {
    testID?: string;
    isSelected: boolean;
    onToggle: () => void;
    allergen: { id: string; name: string; icon: string; description: string };
  }) => {
    const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <Pressable testID={testID} onPress={onToggle} accessibilityState={{ checked: isSelected }}>
        <Text>{testID}</Text>
      </Pressable>
    );
  },
}));

jest.mock('@/features/onboarding/components/DietaryPreferenceCard', () => ({
  DietaryPreferenceCard: ({
    testID,
    isSelected,
    onToggle,
  }: {
    testID?: string;
    isSelected: boolean;
    onToggle: () => void;
    preference: { id: string; name: string; icon: string };
  }) => {
    const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <Pressable testID={testID} onPress={onToggle} accessibilityState={{ checked: isSelected }}>
        <Text>{testID}</Text>
      </Pressable>
    );
  },
}));

jest.mock('@/features/onboarding/components/DisclaimerCard', () => ({
  DisclaimerCard: () => {
    const { View, Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <View testID="disclaimer-card">
        <Text>Allergen Disclaimer</Text>
      </View>
    );
  },
}));

jest.mock('@/shared/components/ui/CollapsibleSection', () => ({
  CollapsibleSection: ({ children }: { children: React.ReactNode }) => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View>{children}</View>;
  },
}));

jest.mock('@/features/profile/components/FeedbackSection', () => ({
  FeedbackSection: () => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View testID="feedback-section-mock" />;
  },
}));

// eslint-disable-next-line import/first
import React from 'react';
// eslint-disable-next-line import/first
import { render, fireEvent } from '@testing-library/react-native';
// eslint-disable-next-line import/first
import ProfileScreen from '../profile';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHookReturn = {
      email: 'test@example.com',
      displayName: 'Test User',
      selectedAllergens: ['milk'],
      selectedDietaryPreferences: ['vegan'],
      isLoading: false,
      error: null,
      hasChanges: false,
      setDisplayName: mockSetDisplayName,
      toggleAllergen: mockToggleAllergen,
      toggleDietaryPreference: mockToggleDietaryPreference,
      saveChanges: mockSaveChanges,
      resetChanges: mockResetChanges,
      signOut: mockSignOut,
    };
  });

  it('renders the profile screen', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('profile-screen')).toBeTruthy();
  });

  it('displays display name in the input', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('input-display-name').props.value).toBe('Test User');
  });

  it('displays email in the input as read-only', () => {
    const { getByTestId } = render(<ProfileScreen />);
    const emailInput = getByTestId('input-email');
    expect(emailInput.props.value).toBe('test@example.com');
    expect(emailInput.props.editable).toBe(false);
  });

  it('renders allergen cards', () => {
    const { getByTestId } = render(<ProfileScreen />);
    const allergenIds = [
      'milk',
      'eggs',
      'fish',
      'shellfish',
      'tree-nuts',
      'peanuts',
      'wheat',
      'soybeans',
      'sesame',
    ];
    allergenIds.forEach((id) => {
      expect(getByTestId(`card-allergen-${id}`)).toBeTruthy();
    });
  });

  it('renders dietary preference cards', () => {
    const { getByTestId } = render(<ProfileScreen />);
    const prefIds = [
      'vegetarian',
      'vegan',
      'gluten-free',
      'keto',
      'paleo',
      'halal',
      'kosher',
      'low-carb',
      'dairy-free',
    ];
    prefIds.forEach((id) => {
      expect(getByTestId(`card-dietary-${id}`)).toBeTruthy();
    });
  });

  it('allergen card is selected when id is in selectedAllergens', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('card-allergen-milk').props.accessibilityState.checked).toBe(true);
    expect(getByTestId('card-allergen-eggs').props.accessibilityState.checked).toBe(false);
  });

  it('dietary card is selected when id is in selectedDietaryPreferences', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('card-dietary-vegan').props.accessibilityState.checked).toBe(true);
    expect(getByTestId('card-dietary-keto').props.accessibilityState.checked).toBe(false);
  });

  it('pressing an allergen card calls toggleAllergen with its id', () => {
    const { getByTestId } = render(<ProfileScreen />);
    fireEvent.press(getByTestId('card-allergen-eggs'));
    expect(mockToggleAllergen).toHaveBeenCalledWith('eggs');
  });

  it('pressing a dietary card calls toggleDietaryPreference with its id', () => {
    const { getByTestId } = render(<ProfileScreen />);
    fireEvent.press(getByTestId('card-dietary-keto'));
    expect(mockToggleDietaryPreference).toHaveBeenCalledWith('keto');
  });

  it('save button is disabled when hasChanges is false', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('btn-save-profile').props.accessibilityState.disabled).toBe(true);
  });

  it('save button is enabled when hasChanges is true', () => {
    mockHookReturn = { ...mockHookReturn, hasChanges: true };
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('btn-save-profile').props.accessibilityState.disabled).toBe(false);
  });

  it('save button is disabled when isLoading is true', () => {
    mockHookReturn = { ...mockHookReturn, hasChanges: true, isLoading: true };
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('btn-save-profile').props.accessibilityState.disabled).toBe(true);
  });

  it('shows loading indicator when isLoading is true', () => {
    mockHookReturn = { ...mockHookReturn, isLoading: true };
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('profile-loading')).toBeTruthy();
  });

  it('does not show loading indicator when isLoading is false', () => {
    const { queryByTestId } = render(<ProfileScreen />);
    expect(queryByTestId('profile-loading')).toBeNull();
  });

  it('shows error message when error is set', () => {
    mockHookReturn = { ...mockHookReturn, error: 'Failed to save.' };
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('profile-error')).toBeTruthy();
  });

  it('does not show error when error is null', () => {
    const { queryByTestId } = render(<ProfileScreen />);
    expect(queryByTestId('profile-error')).toBeNull();
  });

  it('pressing save calls saveChanges', () => {
    mockHookReturn = { ...mockHookReturn, hasChanges: true };
    const { getByTestId } = render(<ProfileScreen />);
    fireEvent.press(getByTestId('btn-save-profile'));
    expect(mockSaveChanges).toHaveBeenCalled();
  });

  it('renders the disclaimer card', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('disclaimer-card')).toBeTruthy();
  });

  it('pressing Sign Out calls signOut', () => {
    const { getByTestId } = render(<ProfileScreen />);
    fireEvent.press(getByTestId('btn-sign-out'));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('pressing Delete Account navigates to delete-account route', () => {
    const { getByTestId } = render(<ProfileScreen />);
    fireEvent.press(getByTestId('btn-delete-account'));
    expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/delete-account');
  });

  it('pressing Privacy Policy navigates to privacy-policy route', () => {
    const { getByTestId } = render(<ProfileScreen />);
    fireEvent.press(getByTestId('btn-privacy-policy'));
    expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/privacy-policy');
  });

  it('displays the app version', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('app-version')).toBeTruthy();
  });
});
