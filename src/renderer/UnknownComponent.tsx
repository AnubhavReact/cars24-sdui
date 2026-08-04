import React from 'react';
import { Text, View } from 'react-native';
import type { Node } from '../schema/types';

// Server sent a component type this client doesn't have a renderer for.
// In dev, show a visible-but-harmless placeholder so it's obvious in the
// fallback demo. In production, render nothing -- the page must never crash
// on an unknown type, and a silent gap beats a redbox.
export function UnknownComponent({ node }: { node: Node }) {
  if (__DEV__) {
    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: '#F59E0B',
          borderStyle: 'dashed',
          borderRadius: 8,
          padding: 8,
          margin: 4,
        }}
      >
        <Text style={{ color: '#B45309', fontSize: 12 }}>
          Unsupported component: "{node.type}" (id: {node.id})
        </Text>
      </View>
    );
  }
  return null;
}
