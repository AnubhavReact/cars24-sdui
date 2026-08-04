import React, { useEffect, useRef } from 'react';
import { Modal, Platform, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SduiProvider, useSdui } from '../../actions/context';
import { RenderNode } from '../../renderer/Renderer';
import homeJsonRaw from '../../data/home.json';
import type { Screen } from '../../schema/types';
import { mark } from '../../perf/timing';
import { createFrameJankTracker } from '../../perf/scrollJank';
import { runAfterPaint } from '../../perf/runAfterPaint';

const screen = homeJsonRaw as unknown as Screen;
const topPad = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 44;

mark('sdui_module_eval_done');
// Synthetic parse-cost estimate: the real payload is `require`d as part of the
// JS bundle (no network fetch, no string parse), so there is no naturally
// isolated "JSON parse" phase to measure. This stringifies + re-parses the
// same payload once to give an honest, clearly-labeled estimate of what that
// phase would cost if this were fetched over the wire as JSON text -- see
// PERF.md for how this number is used and its caveats.
const jsonParseBenchStart = Date.now();
JSON.parse(JSON.stringify(homeJsonRaw));
const jsonParseBenchMs = Date.now() - jsonParseBenchStart;

const jank = createFrameJankTracker();

function HomeScreenInner() {
  const { stack, pop, activeSheet, closeSheet } = useSdui();
  const top = stack[stack.length - 1];
  const mountStart = useRef(Date.now()).current;

  useEffect(() => {
    mark('sdui_mount_committed');
    runAfterPaint(() => {
      mark('sdui_interactions_ready');
    });
    // eslint-disable-next-line no-console
    console.log(`[perf] sdui_json_parse_bench: ${jsonParseBenchMs}ms (synthetic, see PERF.md)`);
    // eslint-disable-next-line no-console
    console.log(`[perf] sdui_mount_to_commit: ${Date.now() - mountStart}ms`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad }}
        onLayout={() => mark('sdui_first_layout')}
        onScrollBeginDrag={() => jank.start()}
        onScrollEndDrag={() => {
          const { droppedFrames, totalFrames } = jank.stop();
          // eslint-disable-next-line no-console
          console.log(`[perf] sdui_scroll_jank: ${droppedFrames} dropped / ${totalFrames} frames`);
        }}
      >
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
