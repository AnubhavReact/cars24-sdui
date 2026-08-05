import type { TextStyle, ViewStyle } from 'react-native';
import type { StyleProps } from '../schema/types';

export function toViewStyle(style?: StyleProps): ViewStyle {
  if (!style) return {};
  return {
    backgroundColor: style.backgroundColor,
    padding: style.padding,
    paddingHorizontal: style.paddingHorizontal,
    paddingVertical: style.paddingVertical,
    margin: style.margin,
    marginHorizontal: style.marginHorizontal,
    marginVertical: style.marginVertical,
    marginTop: style.marginTop,
    marginBottom: style.marginBottom,
    borderRadius: style.borderRadius,
    borderWidth: style.borderWidth,
    borderColor: style.borderColor,
    gap: style.gap,
    width: style.width as ViewStyle['width'],
    height: style.height as ViewStyle['height'],
    aspectRatio: style.aspectRatio,
    alignItems: style.align,
    justifyContent: style.justify,
  };
}

export function toTextStyle(style?: StyleProps): TextStyle {
  if (!style) return {};
  return {
    color: style.color,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    textAlign: style.textAlign,
  };
}

export function toneColor(tone?: string): string {
  switch (tone) {
    case 'success':
      return '#DCFCE7';
    case 'warning':
      return '#FEF3C7';
    case 'danger':
      return '#FEE2E2';
    case 'brand':
      return '#EDE9FE';
    case 'info':
    default:
      return '#E0E7FF';
  }
}
