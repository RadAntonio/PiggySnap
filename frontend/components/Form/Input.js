import { View, Text, StyleSheet, TextInput } from "react-native";
import { Colors } from "../../constants/Colors";

function Input({ label, onUpdateValue, placeholder, value, isInvalid }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, isInvalid && styles.labelInvalid]}>{label}</Text>
      <TextInput
        style={[styles.input, isInvalid && styles.inputInvalid]}
        placeholder={placeholder}
        value={value}
        onChangeText={onUpdateValue}
        autoCapitalize="none"
      />
    </View>
  );
}

export default Input;

const styles = StyleSheet.create({
    inputContainer: {
      marginVertical: 8,
    },
    label: {
      color: "white",
      marginBottom: 4,
    },
    labelInvalid: {
      color: "red"
    },
    input: {
      paddingVertical: 8,
      paddingHorizontal: 6,
      backgroundColor: Colors.primary100,
      borderRadius: 4,
      fontSize: 16,
    },
    inputInvalid: {
      backgroundColor: "red"
    },
  });