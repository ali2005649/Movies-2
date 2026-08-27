import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

type MoviePlayerProps = {
  movieId?: string;
  visible: boolean;
  onClose: () => void;
};

export default function MoviePlayer({ movieId, visible, onClose }: MoviePlayerProps) {
  if (!visible) return null;

  // رابط الفلم المباشر
  const videoUrl = `https://vidsrc.me/embed/movie/${movieId}`;

  // كود حقن لمنع النوافذ المنبثقة والإعلانات
  const runFirst = `
    window.open = function() { return null; };
    window.alert = function() { return null; };
    true;
  `;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* شريط الإغلاق */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>

        {/* مشغل الفيديو */}
        <WebView
          source={{ uri: videoUrl }}
          style={styles.webview}
          allowsInlineMediaPlayback={true}
          javaScriptCanOpenWindowsAutomatically={false}
          injectedJavaScript={runFirst}
          onShouldStartLoadWithRequest={(request) => {
            // السماح فقط لرابط السيرفر ومنع الإعلانات الخارجية
            return request.url.includes('vidsrc.me');
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  header: { padding: 15, backgroundColor: '#09090B', alignItems: 'flex-end' },
  closeButton: { padding: 8, paddingHorizontal: 16, backgroundColor: '#EAB308', borderRadius: 8 },
  closeText: { color: '#09090B', fontWeight: 'bold' },
  webview: { flex: 1, backgroundColor: '#09090B' }
});