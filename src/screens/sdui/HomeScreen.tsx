import React from 'react';
import { Modal, Platform, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SduiProvider, useSdui } from '../../actions/context';
import { RenderNode } from '../../renderer/Renderer';
import homeJson from '../../data/home.json';
import type { Screen } from '../../schema/types';

const screen = homeJson as unknown as Screen;
const topPad = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 44;

function HomeScreenInner() {
  const { stack, pop, activeSheet, closeSheet } = useSdui();
  const top = stack[stack.length - 1];

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView>
        {screen.sections.map((node) => (
          <RenderNode key={node.id} node={node} />
        ))}
      </ScrollView>

      {top && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#FFFFFF',
            paddingTop: topPad,
          }}
        >
          <View style={{ padding: 16 }}>
            <Pressable onPress={pop} style={{ marginBottom: 16 }}>
              <Text style={{ color: '#4B3AF0', fontWeight: '700', fontSize: 16 }}>{'< Back'}</Text>
            </Pressable>
            <Text style={{ fontSize: 20, fontWeight: '700' }}>Screen: {top.screenId}</Text>
            {top.params && (
              <Text style={{ marginTop: 8, color: '#6B7280' }}>{JSON.stringify(top.params)}</Text>
            )}
            <Text style={{ marginTop: 16, color: '#6B7280' }}>
              Placeholder destination -- this proves the navigate action carries a screen id +
              params straight from JSON. Only the home screen's JSON has been built so far.
            </Text>
          </View>
        </View>
      )}

      <Modal visible={!!activeSheet} transparent animationType="slide" onRequestClose={closeSheet}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 20,
              minHeight: 200,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700' }}>Sheet: {activeSheet?.sheetId}</Text>
            {activeSheet?.params && (
              <Text style={{ marginTop: 8, color: '#6B7280' }}>
                {JSON.stringify(activeSheet.params)}
              </Text>
            )}
            <Pressable onPress={closeSheet} style={{ marginTop: 20, alignSelf: 'flex-start' }}>
              <Text style={{ color: '#4B3AF0', fontWeight: '700' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function HomeScreen() {
  return (
    <SduiProvider initialState={{ activeTab: 'all' }}>
      <HomeScreenInner />
    </SduiProvider>
  );
}
