import React from 'react';
import { Text, View, ViewStyle, TextStyle } from 'react-native';

export function ButtonView({
  label,
  variant = 'primary',
  selected,
  style,
  textStyle,
}: {
  label: string;
  variant?: string;
  selected?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  const base: ViewStyle = {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: variant === 'chip' ? 20 : 8,
    alignItems: 'center',
  };

  const variantStyle: ViewStyle =
    variant === 'primary'
      ? { backgroundColor: '#4B3AF0' }
      : variant === 'secondary'
        ? { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#4B3AF0' }
        : variant === 'chip'
          ? { backgroundColor: selected ? '#FFFFFF' : 'rgba(255,255,255,0.15)' }
          : {};

  const labelColor =
    variant === 'primary'
      ? '#FFFFFF'
      : variant === 'secondary'
        ? '#4B3AF0'
        : variant === 'chip'
          ? selected
            ? '#4B3AF0'
            : '#FFFFFF'
          : '#4B3AF0';

  return (
    <View style={[base, variantStyle, style]}>
      <Text style={[{ color: labelColor, fontWeight: '600' }, textStyle]}>{label}</Text>
    </View>
  );
}
