import { View, Text, FlatList, StyleSheet, Animated } from "react-native";
import { useState, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { Dimensions } from "react-native";

import GetStartedFlatListSlider from "../../constants/GetStartedFlatListSlider";
import GetStartedItem from "./GetStartedItem";
import Paginator from "./Paginator";
import GetStartedButton from "./GetStartedButton";

function GetStarted() {
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");

  const slidesRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const index = Math.round(value / width);
      setCurrentIndex(index);
    });

    return () => scrollX.removeListener(listener);
  }, []);

  function getStartedHandler() {
    navigation.navigate("SignupScreen");
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 4 }}>
        <FlatList
          data={GetStartedFlatListSlider}
          renderItem={({ item }) => <GetStartedItem item={item} />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
            }
          )}
          scrollEventThrottle={32}
//        onViewableItemsChanged={viewableItemsChanged}
          ref={slidesRef}
        />
      </View>
      <View style={styles.footer}>
        <Paginator data={GetStartedFlatListSlider} scrollX={scrollX} />
        <View style={styles.buttonWrapper}>
          <GetStartedButton
            onPress={getStartedHandler}
            disabled={currentIndex !== GetStartedFlatListSlider.length - 1}
            show={currentIndex === GetStartedFlatListSlider.length - 1}
          />
        </View>
      </View>
    </View>
  );
}

export default GetStarted;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flex: 1.3,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: -10,
    gap: 20,
  },
});
