import React from 'react';
import { View, ViewStyle, Animated } from 'react-native';
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

interface BrandLogoProps {
  size?: number;
  style?: ViewStyle;
  color?: string;
  showBackground?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 120, 
  style, 
  color = 'white',
  showBackground = true 
}) => {
  const viewBoxSize = 1024;
  const strokeWidth = 80;

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} fill="none">
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#6366F1" />
            <Stop offset="100%" stopColor="#4338CA" />
          </LinearGradient>
        </Defs>

        {showBackground && (
          <Rect 
            width={viewBoxSize} 
            height={viewBoxSize} 
            rx={220} 
            fill="url(#grad)" 
          />
        )}
        
        {/* Left Pillar of H */}
        <Path 
          d="M320 280V744" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          strokeLinecap="round" 
        />
        
        {/* Right Pillar and Checkmark Integration */}
        <Path 
          d="M704 280V440L480 744L320 584" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Crossbar of H */}
        <Path 
          d="M320 512H580" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          strokeLinecap="round" 
        />
      </Svg>
    </View>
  );
};
