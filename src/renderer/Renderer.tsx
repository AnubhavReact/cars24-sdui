import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ImageStyle, Pressable, ScrollView, Text, View } from 'react-native';
import { useSdui } from '../actions/context';
import type { Node } from '../schema/types';
import { ButtonView } from './ButtonView';
import { evalCondition } from './evalCondition';
import { toTextStyle, toneColor, toViewStyle } from './styleUtils';
import { UnknownComponent } from './UnknownComponent';

// The component registry: a plain map from `type` string to a renderer.
// A miss here is *not* an error -- it's exactly the unknown-component case,
// handled by falling through to UnknownComponent below.
const REGISTERED_TYPES = new Set([
  'stack',
  'row',
  'carousel',
  'grid',
  'list',
  'text',
  'image',
  'icon',
  'badge',
  'button',
  'divider',
  'spacer',
  'tappable',
]);

export function RenderNode({ node }: { node: Node }) {
  const { state, dispatch } = useSdui();

  if (!evalCondition(node.visibleIf, state)) return null;

  const content = renderByType(node);

  if (node.onTap) {
    const action = node.onTap;
    return (
      <Pressable onPress={() => dispatch(action)} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }
  return content;
}

function renderByType(node: Node): React.ReactElement {
  if (!REGISTERED_TYPES.has(node.type)) {
    return <UnknownComponent node={node} />;
  }

  const viewStyle = toViewStyle(node.style);
  const textStyle = toTextStyle(node.style);
  const props = node.props ?? {};

  switch (node.type) {
    case 'stack':
      return (
        <View style={[{ flexDirection: 'column' }, viewStyle]}>
          {node.children?.map((c) => (
            <RenderNode key={c.id} node={c} />
          ))}
        </View>
      );

    case 'row':
      return (
        <View
          style={[{ flexDirection: 'row', flexWrap: props.wrap ? 'wrap' : 'nowrap' }, viewStyle]}
        >
          {node.children?.map((c) => (
            <RenderNode key={c.id} node={c} />
          ))}
        </View>
      );

    case 'carousel':
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={!!props.showsIndicator}
          style={viewStyle}
          contentContainerStyle={{ gap: node.style?.gap ?? 12, paddingRight: 16 }}
        >
          {node.children?.map((c) => (
            <RenderNode key={c.id} node={c} />
          ))}
        </ScrollView>
      );

    case 'grid': {
      const columns = Number(props.columns ?? 2);
      return (
        <View style={[{ flexDirection: 'row', flexWrap: 'wrap' }, viewStyle]}>
          {node.children?.map((c) => (
            <View key={c.id} style={{ width: `${100 / columns}%`, padding: 4 }}>
              <RenderNode node={c} />
            </View>
          ))}
        </View>
      );
    }

    case 'list':
      return (
        <View style={viewStyle}>
          {node.children?.map((c) => (
            <RenderNode key={c.id} node={c} />
          ))}
        </View>
      );

    case 'text':
      return (
        <Text style={textStyle} numberOfLines={props.numberOfLines as number | undefined}>
          {String(props.content ?? '')}
        </Text>
      );

    case 'image':
      return (
        <Image
          source={{ uri: String(props.uri ?? '') }}
          style={[{ width: '100%', backgroundColor: '#E5E7EB' }, viewStyle] as ImageStyle[]}
          resizeMode={(props.resizeMode as 'cover' | 'contain') ?? 'cover'}
        />
      );

    case 'icon':
      return (
        <Ionicons
          name={String(props.name ?? 'help-circle-outline') as keyof typeof Ionicons.glyphMap}
          size={Number(props.size ?? 24)}
          color={node.style?.color ?? '#000000'}
        />
      );

    case 'badge':
      return (
        <View
          style={[
            {
              backgroundColor: toneColor(props.tone as string),
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              alignSelf: 'flex-start',
            },
            viewStyle,
          ]}
        >
          <Text style={[{ fontSize: 12, color: '#374151' }, textStyle]}>
            {String(props.text ?? '')}
          </Text>
        </View>
      );

    case 'button':
      return (
        <ButtonView
          label={String(props.label ?? '')}
          variant={props.variant as string}
          selected={!!props.selected}
          style={viewStyle}
          textStyle={textStyle}
        />
      );

    case 'divider':
      return (
        <View
          style={[{ height: Number(props.thickness ?? 1), backgroundColor: '#E5E7EB' }, viewStyle]}
        />
      );

    case 'spacer': {
      const size = Number(props.size ?? 8);
      return <View style={{ height: size, width: size }} />;
    }

    case 'tappable':
      // No visual of its own -- onTap is attached one level up in RenderNode.
      // Fragment-wrap in case a payload ever gives it >1 child.
      return (
        <>
          {node.children?.map((c) => (
            <RenderNode key={c.id} node={c} />
          ))}
        </>
      );

    default:
      return <UnknownComponent node={node} />;
  }
}
