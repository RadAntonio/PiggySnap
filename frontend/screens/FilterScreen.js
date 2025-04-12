import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import DropDownPicker from "react-native-dropdown-picker";
import { useEffect } from "react";
import axios from "axios";
import { API_URL } from "../context/AuthContext";
import SubmitButton from "../components/SignupPage/SubmitButton";
import { Colors } from "../constants/Colors";

const months = [
  { label: "Jan", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Apr", value: 4 },
  { label: "May", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Aug", value: 8 },
  { label: "Sep", value: 9 },
  { label: "Oct", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dec", value: 12 },
];

export default function FilterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentFilters = {}, onApply } = route.params || {};
  const [shopName, setShopName] = useState(currentFilters.shop_name || "");
  const [selectedMonth, setSelectedMonth] = useState(
    currentFilters.month ? String(currentFilters.month) : ""
  );
  const [selectedDay, setSelectedDay] = useState(
    currentFilters.day_of_month ? String(currentFilters.day_of_month) : ""
  );
  const [selectedYear, setSelectedYear] = useState(
    currentFilters.year ? String(currentFilters.year) : ""
  );
  const [openTags, setOpenTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState(
    Array.isArray(currentFilters.tags)
      ? currentFilters.tags
      : typeof currentFilters.tags === "string"
      ? currentFilters.tags.split(",")
      : []
  );
  const [startDate, setStartDate] = useState(currentFilters.start_date || "");
  const [endDate, setEndDate] = useState(currentFilters.end_date || "");
  const [allTags, setAllTags] = useState([]);
  const [lastXDays, setLastXDays] = useState(currentFilters.last_x_days || "");
  const [useLast7Days, setUseLast7Days] = useState(
    currentFilters.last_7_days === "true" || false
  );
  const [minTotal, setMinTotal] = useState(currentFilters.min_total || "");
  const [maxTotal, setMaxTotal] = useState(currentFilters.max_total || "");
  const [exactTotal, setExactTotal] = useState(
    currentFilters.exact_total || ""
  );

  const handleApplyFilter = () => {
    const { onApply } = route.params || {};
    if (onApply) {
      const appliedFilters = {};
      if (shopName) appliedFilters.shop_name = shopName;
      if (selectedMonth) appliedFilters.month = parseInt(selectedMonth);
      if (selectedDay) appliedFilters.day_of_month = parseInt(selectedDay);
      if (selectedYear) appliedFilters.year = parseInt(selectedYear);
      if (selectedTags.length > 0) {
        appliedFilters.tags = selectedTags.join(",");
      }
      if (startDate) appliedFilters.start_date = startDate;
      if (endDate) appliedFilters.end_date = endDate;
      if (lastXDays) appliedFilters.last_x_days = lastXDays;
      if (useLast7Days) appliedFilters.last_7_days = true;

      if (minTotal) appliedFilters.min_total = minTotal;
      if (maxTotal) appliedFilters.max_total = maxTotal;
      if (exactTotal) appliedFilters.exact_total = exactTotal;

      onApply(appliedFilters);
    }
    navigation.goBack();
  };

  useEffect(() => {
    axios.get(`${API_URL}/receipt/tags/list`).then((res) => {
      const dropdownItems = res.data.map((tag) => ({
        label: tag.name,
        value: tag.name,
      }));
      setAllTags(dropdownItems);
    });
  }, []);

  const days = [...Array(31)].map((_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString(),
  }));

  const years = Array.from({ length: 31 }, (_, i) => {
    const year = 2020 + i;
    return { label: year.toString(), value: year.toString() };
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 70 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <View style={styles.dragIndicator} />
              <Text style={styles.title}>Filter your Receipt List!</Text>
              <Text style={styles.inputTitle}>Shop Name</Text>
              <TextInput
                placeholder="Enter shop name"
                value={shopName}
                onChangeText={setShopName}
                style={styles.input}
              />
              <Text style={styles.inputTitle}>Select Date</Text>
              <View style={styles.row}>
                <View style={styles.flexThird}>
                  <Picker
                    selectedValue={selectedDay}
                    onValueChange={(itemValue) => setSelectedDay(itemValue)}
                  >
                    <Picker.Item label="-D-" value="" />
                    {days.map((d) => (
                      <Picker.Item
                        key={d.value}
                        label={d.label}
                        value={d.value}
                      />
                    ))}
                  </Picker>
                </View>
                <View style={styles.flexThird}>
                  <Picker
                    selectedValue={selectedMonth}
                    onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                  >
                    <Picker.Item label="-M-" value="" />
                    {months.map((m) => (
                      <Picker.Item
                        key={m.value}
                        label={m.label}
                        value={String(m.value)}
                      />
                    ))}
                  </Picker>
                </View>

                <View style={styles.flexThird}>
                  <Picker
                    selectedValue={selectedYear}
                    onValueChange={(itemValue) => setSelectedYear(itemValue)}
                  >
                    <Picker.Item label="-Y-" value="" />
                    {years.map((y) => (
                      <Picker.Item
                        key={y.value}
                        label={y.label}
                        value={y.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              <Text style={styles.inputTitle}>Tags</Text>
              <DropDownPicker
                multiple={true}
                open={openTags}
                value={selectedTags}
                items={allTags}
                setOpen={setOpenTags}
                setValue={setSelectedTags}
                setItems={setAllTags}
                placeholder="Select tags..."
                style={{ marginBottom: 20, borderColor: "#ccc" }}
                dropDownContainerStyle={{ zIndex: 1000, borderColor: "#ccc" }}
              />
              <View style={styles.datePickerContainer}>
                <View>
                  <Text style={styles.inputTitle}>Start Date</Text>
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    value={startDate}
                    onChangeText={setStartDate}
                    style={[styles.input, { minWidth: 180 }]}
                  />
                </View>
                <View>
                  <Text style={styles.inputTitle}>End Date</Text>
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    value={endDate}
                    onChangeText={setEndDate}
                    style={[styles.input, { minWidth: 180 }]}
                  />
                </View>
              </View>
              <Text style={styles.inputTitle}>Last x Days</Text>
              <TextInput
                placeholder="Enter X days"
                value={lastXDays.toString()}
                onChangeText={setLastXDays}
                keyboardType="numeric"
                style={[styles.input]}
              />
              <Text style={styles.inputTitle}>Total Filters</Text>
              <View style={styles.row}>
                <TextInput
                  placeholder="Min"
                  value={minTotal.toString()}
                  onChangeText={setMinTotal}
                  keyboardType="numeric"
                  style={[styles.input, styles.totalInput]}
                />
                <TextInput
                  placeholder="Max"
                  value={maxTotal.toString()}
                  onChangeText={setMaxTotal}
                  keyboardType="numeric"
                  style={[styles.input, styles.totalInput]}
                />
                <TextInput
                  placeholder="Exact"
                  value={exactTotal.toString()}
                  onChangeText={setExactTotal}
                  keyboardType="numeric"
                  style={[styles.input, styles.totalInput]}
                />
              </View>

              {/* <Pressable style={styles.button} onPress={handleApplyFilter}>
                <Text style={styles.buttonText}>Apply Filter</Text>
              </Pressable> */}
              <SubmitButton
                onPress={handleApplyFilter}
                text="Apply Filter"
                style={styles.button}
                textStyle={styles.buttonText}
              />
              <Pressable onPress={() => navigation.goBack()}>
                <Text style={styles.close}>Close</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modal: {
    height: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  close: {
    marginTop: 20,
    color: "#888",
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.primary600,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  close: {
    color: "#888",
    textAlign: "center",
  },
  inputTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "black",
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  flexThird: {
    width: "32%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    overflow: "hidden",
  },
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    gap: 8,
  },
  totalInput: {
    flex: 1,
    minWidth: 0,
  },
});
