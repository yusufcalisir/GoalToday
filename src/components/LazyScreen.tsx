import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

export const LazyScreen = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100); // Small delay to allow initial app load to be faster
      return () => clearTimeout(timer);
    }, []);

    if (!isLoaded) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4A00E0" />
        </View>
      );
    }

    return <Component {...props} />;
  };
};
