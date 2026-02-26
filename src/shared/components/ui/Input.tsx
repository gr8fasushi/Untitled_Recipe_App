import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: TextInputProps['autoComplete'];
  keyboardType?: TextInputProps['keyboardType'];
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: () => void;
  editable?: boolean;
  testID?: string;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry,
  autoCapitalize = 'none',
  autoComplete,
  keyboardType,
  returnKeyType,
  onSubmitEditing,
  editable = true,
  testID,
}: InputProps): React.JSX.Element {
  return (
    <View className="mb-4">
      {label !== undefined && (
        <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
        testID={testID}
        className={`rounded-2xl border px-4 py-3.5 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ${
          error !== undefined ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
        } ${editable === false ? 'opacity-50' : ''}`}
      />
      {error !== undefined && (
        <Text
          className="mt-1.5 text-sm text-red-600"
          testID={testID ? `${testID}-error` : undefined}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
