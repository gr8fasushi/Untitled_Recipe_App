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
        <Text className="mb-1 text-sm font-medium text-gray-700">{label}</Text>
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
        className={`rounded-xl border px-4 py-3 text-gray-900 bg-white ${
          error !== undefined ? 'border-red-500' : 'border-gray-300'
        } ${editable === false ? 'opacity-50' : ''}`}
      />
      {error !== undefined && (
        <Text className="mt-1 text-sm text-red-600" testID={testID ? `${testID}-error` : undefined}>
          {error}
        </Text>
      )}
    </View>
  );
}
