import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { logger } from '../utils/logger';
import { Analytics } from '../utils/analytics';
import { AlertCircle, RotateCcw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('[ErrorBoundary] Caught error', { error, info: errorInfo });
    Analytics.trackEvent('ERROR_OCCURRED', { type: 'ErrorBoundary', message: error.message });
  }

  handleRestart = () => {
      // In a real app, might want to restart via RNRestart or similar
      // For now, simple state reset which might work if error was transient
      this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <AlertCircle size={64} color="#FF5252" style={{ marginBottom: 20 }} />
            <Text style={styles.title}>Uppss!</Text>
            <Text style={styles.subtitle}>
              Beklenmedik bir sorun oluştu. Merak etme, hata raporlandı.
            </Text>
            
            <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                    {this.state.error?.toString()}
                </Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
              <RotateCcw size={20} color="white" />
              <Text style={styles.buttonText}>Yeniden Dene</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 30,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  errorBox: {
      backgroundColor: '#f5f5f5',
      padding: 15,
      borderRadius: 10,
      width: '100%',
      marginBottom: 30,
      borderWidth: 1,
      borderColor: '#eee',
  },
  errorText: {
      color: '#FF5252',
      fontFamily: 'monospace',
      fontSize: 12,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#4A00E0',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#4A00E0',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
