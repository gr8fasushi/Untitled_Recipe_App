import { Pressable, Text } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  testID?: string;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  testID,
  fullWidth = false,
}: ButtonProps): React.JSX.Element {
  const variantClasses = {
    primary: 'bg-primary-600 shadow-sm',
    secondary: 'bg-gray-100 dark:bg-gray-700',
    danger: 'bg-red-600',
    ghost: 'bg-transparent border border-primary-600',
  };

  const textClasses = {
    primary: 'text-white font-bold',
    secondary: 'text-gray-800 dark:text-gray-100 font-semibold',
    danger: 'text-white font-bold',
    ghost: 'text-primary-600 font-semibold',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`px-5 py-3.5 rounded-2xl items-center ${variantClasses[variant]} ${disabled ? 'opacity-50' : ''} ${fullWidth ? 'w-full' : ''}`}
      testID={testID}
      accessibilityState={{ disabled: !!disabled }}
    >
      <Text className={`text-base text-center ${textClasses[variant]}`}>{label}</Text>
    </Pressable>
  );
}
