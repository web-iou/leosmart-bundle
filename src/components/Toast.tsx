import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { hideToast } from '../store/slices/toastSlice';

const Toast = () => {
  const dispatch = useDispatch();
  const { visible, message, type, duration, position } = useSelector(
    (state: RootState) => state.toast
  );

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 显示Toast
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 设置自动隐藏
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          dispatch(hideToast());
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, dispatch, opacity]);

  if (!visible) return null;

  // 根据类型获取背景颜色
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
      default:
        return '#2196F3';
    }
  };

  // 根据位置获取样式
  const getPositionStyle = () => {
    return position === 'top' ? styles.topPosition : styles.bottomPosition;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyle(),
        { backgroundColor: getBackgroundColor(), opacity },
      ]}
    >
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity
        onPress={() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            dispatch(hideToast());
          });
        }}
        style={styles.closeButton}
      >
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  topPosition: {
    top: 50,
  },
  bottomPosition: {
    bottom: 50,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    marginLeft: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Toast; 