import { Pressable, Text } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  testID,
}: ButtonProps): React.JSX.Element {
  const variantClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-gray-200',
    danger: 'bg-red-600',
  };

  const textClasses = {
    primary: 'text-white',
    secondary: 'text-gray-900',
    danger: 'text-white',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`px-4 py-3 rounded-xl items-center ${variantClasses[variant]} ${disabled ? 'opacity-50' : ''}`}
      testID={testID}
    >
      <Text className={`font-semibold text-center ${textClasses[variant]}`}>{label}</Text>
    </Pressable>
  );
}
