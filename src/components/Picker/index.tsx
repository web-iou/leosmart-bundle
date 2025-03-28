import React, {useState, useRef, useEffect, memo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  Modal,
  Pressable,
} from 'react-native';
import Action from '../Action'; // 引入 Action 组件

const ITEM_HEIGHT = 44;

const Picker = ({
  visible = false,
  data = [],
  onConfirm,
  onCancel,
  defaultValue,
}: {
  visible: boolean;
  data: string[];
  onConfirm: (value: string) => void;
  onCancel: () => void;
  defaultValue?: string;
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue ?? data[0]);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // 计算初始滚动位置
  const initialIndex = data.findIndex(item => item === defaultValue);
  console.log(selectedValue);
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  }, [visible, fadeAnim]);

  useEffect(() => {
    if (visible && scrollRef.current && initialIndex >= 0) {
      setSelectedValue(data[initialIndex]);
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: initialIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 100);
    }
  }, [visible, initialIndex]);

  const handleConfirm = () => {
    onConfirm && onConfirm(selectedValue);
  };

  const handleCancel = () => {
    onCancel && onCancel();
  };
  const handleItemPress = (index: number) => {
    // 滚动到点击的项目
    scrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  };
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <Animated.View style={[styles.outerContainer, {opacity: fadeAnim}]}>
        {/* 外层遮罩 */}
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <Action show={visible} style={styles.container}>
          <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={styles.confirmText}>确定</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              {/* 中间选中项指示器 */}
              <View style={styles.pickerIndicator} />
              <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onScroll={event => {
                  const y = event.nativeEvent.contentOffset.y;
                  const index = Math.round(y / ITEM_HEIGHT);
                  if (index >= 0 && index < data.length) {
                    setSelectedValue(data[index]);
                  }
                }}
                contentContainerStyle={styles.scrollContent}>
                {/* 添加空白项使选择器位于中间 */}
                <View style={{height: ITEM_HEIGHT * 2}} />

                {data.map((item, index) => (
                  <Pressable
                    key={index}
                    style={styles.item}
                    onPress={() => handleItemPress(index)}>
                    <Text
                      style={[
                        styles.itemText,
                        selectedValue === item && styles.selectedItemText,
                      ]}>
                      {item}
                    </Text>
                  </Pressable>
                ))}

                {/* 添加空白项使选择器位于中间 */}
                <View style={{height: ITEM_HEIGHT * 2}} />
              </ScrollView>
            </View>
          </View>
        </Action>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    height: 300, // 固定高度确保有足够空间
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelText: {
    fontSize: 16,
    color: '#999',
  },
  confirmText: {
    fontSize: 16,
    color: '#1677ff',
  },
  pickerContainer: {
    height: ITEM_HEIGHT * 5,
    position: 'relative',
    backgroundColor: 'white',
  },
  maskTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 3,
  },
  maskBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 3,
  },
  pickerIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedItemText: {
    color: '#1677ff',
    fontWeight: 'bold',
  },
});

export default memo(Picker);
