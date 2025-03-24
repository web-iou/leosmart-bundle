import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import SafeAreaLayout from '@/components/SafeAreaLayout';

interface WebViewPageProps {
  navigation: any;
  route: {
    params: {
      title: string;
      url: string;
    };
  };
}

const WebViewPage: React.FC<WebViewPageProps> = ({ navigation, route }) => {
  const { title, url } = route.params;
  useTranslation();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaLayout edges={['right', 'left', 'bottom']}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBackPress} />
        <Appbar.Content title={title} />
      </Appbar.Header>

      <View style={styles.webViewContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        <WebView
          source={{ uri: url }}
          style={styles.webView}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
      </View>
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default WebViewPage; 