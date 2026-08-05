import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { HomeScreen } from './src/screens/sdui/HomeScreen';
import { StaticHomeScreen } from './src/screens/static/StaticHomeScreen';
import { DevModeProvider, useDevMode } from './src/devmode/context';

// For actual cold-start perf measurement (PERF.md), this is flipped and the
// app is rebuilt as a release APK per variant, so each variant is genuinely
// the first thing rendered after a cold process start -- see PERF.md
// methodology. The in-app toggle below is for demo/manual QA only; switching
// at runtime after a warm launch does not produce valid cold-start numbers
// for the screen switched *into*.
const INITIAL_SCREEN: 'sdui' | 'static' = 'sdui';

function DevOverlayToggle() {
  const { showDebugOverlays, toggle } = useDevMode();
  if (!__DEV__) return null;
  return (
    <Pressable
      onPress={toggle}
      style={{
        position: 'absolute',
        bottom: 76,
        right: 16,
        backgroundColor: showDebugOverlays ? '#B45309' : '#111827',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 24,
        opacity: 0.85,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>
        {showDebugOverlays ? 'Dev overlays: ON' : 'Dev overlays: OFF (real-user view)'}
      </Text>
    </Pressable>
  );
}

function AppInner() {
  const [variant, setVariant] = useState<'sdui' | 'static'>(INITIAL_SCREEN);

  return (
    <View style={{ flex: 1 }}>
      {variant === 'sdui' ? <HomeScreen /> : <StaticHomeScreen />}
      <DevOverlayToggle />
      <Pressable
        onPress={() => setVariant((v) => (v === 'sdui' ? 'static' : 'sdui'))}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 16,
          backgroundColor: '#111827',
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 24,
          opacity: 0.85,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>
          {variant === 'sdui' ? 'SDUI ⇄ Static' : 'Static ⇄ SDUI'}
        </Text>
      </Pressable>
      <StatusBar style="light" />
    </View>
  );
}

export default function App() {
  return (
    <DevModeProvider>
      <AppInner />
    </DevModeProvider>
  );
}
