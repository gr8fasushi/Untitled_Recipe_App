import { TextInput, Text, View } from 'react-native';
import { MAX_NOTES_LENGTH } from '../types';

interface RecipeNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  testID?: string;
}

export function RecipeNotes({
  notes,
  onNotesChange,
  testID = 'recipe-notes',
}: RecipeNotesProps): React.JSX.Element {
  return (
    <View testID={testID}>
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm font-semibold text-gray-700">Private Notes</Text>
        <Text
          testID={`${testID}-counter`}
          className={`text-xs ${notes.length > MAX_NOTES_LENGTH ? 'text-red-500' : 'text-gray-400'}`}
        >
          {notes.length}/{MAX_NOTES_LENGTH}
        </Text>
      </View>
      <TextInput
        testID={`${testID}-input`}
        value={notes}
        onChangeText={(text) => {
          if (text.length <= MAX_NOTES_LENGTH) {
            onNotesChange(text);
          }
        }}
        placeholder="Add cooking notes…"
        multiline
        numberOfLines={4}
        maxLength={MAX_NOTES_LENGTH}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 bg-gray-50 min-h-[80px]"
        textAlignVertical="top"
      />
    </View>
  );
}
