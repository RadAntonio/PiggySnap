import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import axios from "axios";
import { Colors } from "../constants/Colors";
import { API_URL, useAuth } from "../context/AuthContext";
import { useFonts } from "expo-font";
import SubmitButton from "../components/SignupPage/SubmitButton";

export default function EditReceiptScreen({ route, navigation }) {
  const { receipt } = route.params;
  const {
    authState: { token },
  } = useAuth();

  const [fontsLoaded] = useFonts({
    "Frankfurt-Am6": require("../assets/fonts/Frankfurt-Am6.ttf"),
  });
  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary600} />
      </View>
    );
  }


  const [shopName, setShopName] = useState(receipt.store || "");
  const [total, setTotal] = useState(String(receipt.amount || ""));
  const [date, setDate] = useState(receipt.date || "");
  const [saving, setSaving] = useState(false);


  const [openTags, setOpenTags] = useState(false);
  const [tagItems, setTagItems] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  useEffect(() => {
    axios
      .get(`${API_URL}/receipt/tags/list`)
      .then((res) => {
        const items = res.data.map((t) => ({ label: t.name, value: t.id }));
        setTagItems(items);
        const initial = res.data
          .filter((t) => receipt.tags.includes(t.name))
          .map((t) => t.id);
        setSelectedTags(initial);
      })
      .catch((err) => console.error("Error fetching tags:", err));
  }, []);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const res = await axios.post(
        `${API_URL}/receipt/tags/create`,
        { name: newTagName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const tag = res.data; // { id, name }
      setTagItems((items) => [...items, { label: tag.name, value: tag.id }]);
      setSelectedTags((ids) => [...ids, tag.id]);
      setNewTagName("");
      setShowAddTagModal(false);
    } catch (err) {
      Alert.alert("Error creating tag", err.message);
    }
  };

  // Items state
  const [items, setItems] = useState(
    (receipt.items || []).map((it) => ({
      name: it.name || "",
      quantity: String(it.quantity || ""),
      unit_price: String(it.unit_price || ""),
      price: String(it.price || ""),
    }))
  );
  const updateItem = (index, key, value) => {
    const newItems = [...items];
    newItems[index][key] = value;
    setItems(newItems);
  };
  const removeItem = (idx) =>
    setItems((cur) => cur.filter((_, i) => i !== idx));
  const addItem = () =>
    setItems((cur) => [
      ...cur,
      { name: "", quantity: "", unit_price: "", price: "" },
    ]);

  const handleSave = async () => {
    if (!token) return Alert.alert("Not authenticated", "Please log in first.");
    setSaving(true);
    try {
      const tagObjects = selectedTags.map((id) => {
        const tag = tagItems.find((item) => item.value === id);
        return { id, name: tag?.label };
      });
      const payload = {
        shop_name: shopName,
        total: parseFloat(total),
        date,
        // nested tag objects
        tags: tagObjects,
        items: items.map((it) => ({
          name: it.name,
          quantity: parseFloat(it.quantity),
          unit_price: parseFloat(it.unit_price),
          price: parseFloat(it.price),
        })),
      };
      const res = await fetch(
        `${API_URL}/receipt/partial_update/${receipt.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(JSON.stringify(body));
      Alert.alert("Success", "Receipt updated successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error saving receipt:", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={60}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Edit Receipt</Text>
        </View>
        <Text style={styles.label}>Shop Name:</Text>
        <TextInput
          style={styles.input}
          value={shopName}
          onChangeText={setShopName}
          placeholder="Enter shop name"
        />
        <Text style={styles.label}>Total:</Text>
        <TextInput
          style={styles.input}
          value={total}
          onChangeText={setTotal}
          placeholder="Enter total amount"
          keyboardType="numeric"
        />

        {/* Date */}
        <Text style={styles.label}>Date (YYYY-MM-DD):</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
        />
        <View style={styles.tagHeader}>
          <Text style={styles.label}>Tags:</Text>
          <SubmitButton
            onPress={() => setShowAddTagModal(true)}
            text="Create Tag"
            style={[styles.smallButton, { backgroundColor: Colors.primary800 }]}
            textStyle={styles.smallButtonText}
          />
        </View>
        <View style={{ zIndex: 1000, marginBottom: 20 }}>
          <DropDownPicker
            multiple
            open={openTags}
            value={selectedTags}
            items={tagItems}
            setOpen={setOpenTags}
            setValue={setSelectedTags}
            setItems={setTagItems}
            placeholder="Select tags"
            listMode="SCROLLVIEW"
            dropDownDirection="BOTTOM"
            dropDownContainerStyle={styles.dropdownContainer}
            style={{
              backgroundColor: "#F9F9F9",
              borderRadius: 12,
              borderColor: "#E0E0E0",
              borderWidth: 4,
            }}
            maxHeight={200}
          />
        </View>
        <View style={styles.itemsHeader}>
          <Text style={styles.itemsTitle}>ITEMS:</Text>
          <SubmitButton
            onPress={addItem}
            text="Add Item"
            style={[styles.smallButton, { backgroundColor: Colors.primary800 }]}
            textStyle={styles.smallButtonText}
          />
        </View>
        {items.map((item, idx) => (
          <View key={idx} style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemLabel}>Item {idx + 1}</Text>
              <SubmitButton
                onPress={() => removeItem(idx)}
                text="Delete"
                style={styles.smallButton}
                textStyle={styles.smallButtonText}
              />
            </View>
            {["name", "quantity", "unit_price", "price"].map((key) => (
              <TextInput
                key={key}
                style={styles.input}
                value={item[key]}
                onChangeText={(v) => updateItem(idx, key, v)}
                placeholder={
                  key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")
                }
                keyboardType={key === "name" ? "default" : "decimal-pad"}
              />
            ))}
          </View>
        ))}

        <SubmitButton
          onPress={handleSave}
          text="Save Changes"
          style={styles.saveButton}
          textStyle={styles.saveButtonText}
        />
      </ScrollView>
      {showAddTagModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Tag</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Tag name"
                value={newTagName}
                onChangeText={setNewTagName}
              />
              <View style={styles.modalButtons}>
                <SubmitButton
                  onPress={handleCreateTag}
                  text="Save"
                  textStyle={styles.modalButtonText}
                  style={{ backgroundColor: Colors.primary800, minWidth: 150 }}
                />
                <SubmitButton
                  text="Cancel"
                  onPress={() => {
                    setShowAddTagModal(false);
                    setNewTagName("");
                  }}
                  style={{ backgroundColor: Colors.primary600, minWidth: 150 }}
                  textStyle={styles.modalButtonText}
                />
              </View>
            </View>
          </View>
        )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 54,
    fontWeight: "700",
    color: Colors.primary600,
    fontFamily: "Frankfurt-Am6",
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
    color: Colors.primary800,
  },
  tagHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    borderBottomWidth: 6,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 4,
  },
  addTagButton: {
    color: Colors.primary600,
    fontSize: 14,
    fontWeight: "600",
  },
  dropdownContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    borderColor: "#E0E0E0",
    borderWidth: 4,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    borderBottomWidth: 6,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 4,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.primary800,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 12,
    borderColor: "#E0E0E0",
    borderWidth: 4,
  },
  smallButton: {
    backgroundColor: Colors.primary600,
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: 30,
  },
  smallButtonText: {
    color: "white",
    fontSize: 12,
  },
  itemContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    borderColor: "#E0E0E0",
    borderWidth: 4,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    color: Colors.primary800,
  },
  saveButton: {
    backgroundColor: Colors.primary800,
    height: 50,
    marginTop: 10,
    marginBottom: 50,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    marginVertical: -10,
    marginHorizontal: -14,
  },
  modalOverlay: {
    position: 'absolute',
    top:  0,    // cover entire parent
    left: 0,
    right:0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,       // float above everything
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 38,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: Colors.primary600,
    fontFamily: "Frankfurt-Am6",
  },
  modalInput: {
    backgroundColor: "#F9F9F9",
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    borderColor: "#E0E0E0",
    borderWidth: 4,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: Colors.primary600,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
  },
});
