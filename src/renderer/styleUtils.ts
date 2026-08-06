import type { TextStyle, ViewStyle } from 'react-native';
import type { StyleProps } from '../schema/types';

// Strips explicit `undefined` values before returning. This matters because
// every caller merges the result into a style ARRAY alongside other style
// objects (e.g. ButtonView's `[base, variantStyle, style]`, or badge's
// `[{backgroundColor: toneColor(...), ...}, viewStyle]`). React Native's
// array-style flattening overwrites earlier keys with later `undefined`
// values -- so an object that always carries every key (even unset ones,
// as `undefined`) silently wipes out any earlier variant/default styling
// the moment a node sets even one unrelated custom style property. This bit
// us for real: a button's `variant: 'primary'` background disappeared the
// first time a node also set `width`, because the returned style object's
// unset `backgroundColor: undefined` clobbered the variant's blue fill.
function omitUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

export function toViewStyle(style?: StyleProps): ViewStyle {
  if (!style) return {};
  return omitUndefined({
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
  });
}

export function toTextStyle(style?: StyleProps): TextStyle {
  if (!style) return {};
  return omitUndefined({
    color: style.color,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    textAlign: style.textAlign,
  });
}

// Base typography preset per `text` node's `variant` prop. This was
// previously a no-op: the renderer only ever applied a node's explicit
// `style`, never looked at `props.variant` at all, so any text node
// relying on `variant: 'title'` alone (no explicit fontSize/fontWeight)
// silently rendered as unstyled plain text -- affected ~19 nodes across
// home.json (most section titles), caught by comparing SDUI vs. Static
// screenshots side by side. `style` still overrides these on a per-node
// basis, same override order as every other variant-based default
// (button, badge) already in the renderer.
export const TEXT_VARIANT_STYLES: Record<string, TextStyle> = {
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400', color: '#6B7280' },
  label: { fontSize: 13, fontWeight: '600' },
};

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
