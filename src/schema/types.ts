// Core SDUI schema types.
//
// Design principle: the registry is a small set of generic layout + content
// primitives (stack, row, carousel, grid, list, text, image, icon, badge,
// button, divider, spacer, tappable) rather than one bespoke component per
// visual section (no "carCard", no "loanRail"). Every section on the real
// Cars24 home page is composed from these primitives. That's the bet this
// schema makes for generalizing to a screen we haven't seen.

export type ComponentType =
  | 'screen'
  | 'stack' // vertical linear layout of children
  | 'row' // horizontal linear layout of children, wraps, no scroll
  | 'carousel' // horizontal scrollable rail of children
  | 'grid' // n-column grid of children
  | 'list' // vertical scrollable list of children
  | 'text'
  | 'image'
  | 'icon'
  | 'badge'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'tappable'; // wraps a single child, adds tap semantics

export type ActionType =
  | 'navigate'
  | 'openUrl'
  | 'openSheet'
  | 'call'
  | 'setState'
  | 'toggleState'
  | 'composite';

export interface NavigateAction {
  type: 'navigate';
  screen: string;
  params?: Record<string, string>;
}

export interface OpenUrlAction {
  type: 'openUrl';
  url: string;
}

export interface OpenSheetAction {
  type: 'openSheet';
  sheet: string;
  params?: Record<string, unknown>;
}

export interface CallAction {
  type: 'call';
  phoneNumber: string;
}

export interface SetStateAction {
  type: 'setState';
  key: string;
  value: unknown;
}

export interface ToggleStateAction {
  type: 'toggleState';
  key: string;
}

export interface CompositeAction {
  type: 'composite';
  actions: Action[];
}

export type Action =
  | NavigateAction
  | OpenUrlAction
  | OpenSheetAction
  | CallAction
  | SetStateAction
  | ToggleStateAction
  | CompositeAction;

// Conditional visibility, driven by client-side state (e.g. which chip is
// selected). Lets the schema express "conditionals" without a scripting
// language.
export type Condition =
  | { state: string; equals: unknown }
  | { state: string; notEquals: unknown }
  | { and: Condition[] }
  | { or: Condition[] };

// Generic style override. Deliberately a flat, small set of properties that
// map ~1:1 onto RN style props, applied by the renderer for every node type
// without any per-component-type styling code.
export interface StyleProps {
  backgroundColor?: string;
  color?: string;
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  margin?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  marginTop?: number;
  marginBottom?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  gap?: number;
  width?: number | string;
  height?: number | string;
  aspectRatio?: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '500' | '600' | '700';
  textAlign?: 'left' | 'center' | 'right';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
}

// Every node's `props` are type-specific and validated by that type's
// registered renderer only -- the renderer never needs to know about types
// it doesn't handle.
export interface Node {
  id: string;
  type: string; // ComponentType, but kept as `string` so unknown types don't fail parsing
  minVersion?: number; // schema/component version this node requires -- see versioning story in README
  style?: StyleProps;
  visibleIf?: Condition;
  onTap?: Action;
  props?: Record<string, unknown>;
  children?: Node[];
}

export interface Screen {
  screenId: string;
  schemaVersion: number;
  title?: string;
  sections: Node[];
}

// ---- Per-type prop shapes (informal — used for editor/AI authoring aid, not runtime-enforced) ----

export interface StackProps {}
export interface RowProps { wrap?: boolean }
export interface CarouselProps { showsIndicator?: boolean }
export interface GridProps { columns: number }
export interface ListProps {}
export interface TextProps {
  content: string;
  variant?: 'title' | 'subtitle' | 'body' | 'caption' | 'label';
  numberOfLines?: number;
}
export interface ImageProps {
  uri: string;
  resizeMode?: 'cover' | 'contain';
}
export interface IconProps {
  name: string; // Ionicons name
  size?: number;
}
export interface BadgeProps {
  text: string;
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'brand';
}
export interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'text' | 'chip';
  selected?: boolean;
}
export interface DividerProps {
  thickness?: number;
}
export interface SpacerProps {
  size: number;
}
