import React from 'react';
import { Text, View } from 'react-native';
import type { Node } from '../schema/types';
import { CLIENT_SCHEMA_VERSION } from '../schema/version';

// Covers two distinct degrade paths that both need to end up here:
// 1. an unknown `type` this client has no renderer for
// 2. a known `type` whose `minVersion` is newer than this client supports
// In dev, show a visible-but-harmless placeholder so both are obvious in
// the fallback demo. In production, render nothing -- the page must never
// crash or show debug text, and a silent gap beats a redbox either way.
export function UnknownComponent({ node }: { node: Node }) {
  if (__DEV__) {
    const isVersionMismatch = node.minVersion !== undefined && node.minVersion > CLIENT_SCHEMA_VERSION;
    const reason = isVersionMismatch
      ? `requires schema v${node.minVersion}, this client supports v${CLIENT_SCHEMA_VERSION}`
      : `unknown type "${node.type}"`;
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
          Skipped (id: {node.id}) -- {reason}
        </Text>
      </View>
    );
  }
  return null;
}
