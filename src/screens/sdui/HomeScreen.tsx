import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SduiProvider, useSdui } from '../../actions/context';
import { RenderNode } from '../../renderer/Renderer';
import homeJsonRaw from '../../data/home.json';
import type { Screen } from '../../schema/types';
import { mark } from '../../perf/timing';
import { createFrameJankTracker } from '../../perf/scrollJank';
import { runAfterPaint } from '../../perf/runAfterPaint';
import { buildLocationPickerSheet, fetchScreenJson } from '../../server/mockServer';
import { cacheKeyFor, getCachedScreen, setCachedScreen } from '../../server/screenCache';

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

// Real, JSON-driven destination for every navigate target. Calls the mock
// server (src/server/mockServer.ts) for ANY screenId -- "listing" and
// "car_detail" return hand-built, param-driven screens; everything else
// falls back to a clean generic dummy screen. Renders through the exact
// same RenderNode/registry used for the home screen.
//
// Stale-while-revalidate, matching the real Cars24 app (verified live: a
// car-detail page shows a skeleton on first visit, but instantly shows
// cached content with no loader on a revisit, refreshed silently in the
// background). First visit to a given screenId+params: show the loading
// state while fetching, then cache the result. Any later visit to the same
// screenId+params: show the cached Screen immediately, no loading state at
// all, while a fresh fetch happens invisibly behind it and updates the
// cache for next time.
function JsonDestination({ screenId, params }: { screenId: string; params?: Record<string, string> }) {
  const cacheKey = cacheKeyFor(screenId, params);
  const wasCached = useRef(getCachedScreen(cacheKey) !== undefined).current;
  const [screen, setScreen] = useState<Screen | null>(() => getCachedScreen(cacheKey) ?? null);
  const dataArrivedAt = useRef<number | null>(null);
  const viewBuildLogged = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setScreen(getCachedScreen(cacheKey) ?? null);
    // Real (not synthetic) fetch + view-build breakdown for the "SDUI
    // breakdown" perf metric -- unlike home.json (bundled locally, no real
    // fetch phase), navigate destinations genuinely go through
    // fetchScreenJson's simulated network delay. Only logged on a true
    // cache miss so the numbers reflect a real fetch, not a cache hit.
    const fetchStart = Date.now();
    fetchScreenJson(screenId, params).then((s) => {
      if (!wasCached) {
        dataArrivedAt.current = Date.now();
        // eslint-disable-next-line no-console
        console.log(`[perf] nav_fetch_ms (${screenId}): ${dataArrivedAt.current - fetchStart}ms`);
      }
      setCachedScreen(cacheKey, s);
      if (!cancelled) setScreen(s);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  if (!screen) {
    return (
      <View style={{ padding: 16, alignItems: 'center', marginTop: 48 }}>
        <ActivityIndicator color="#4B3AF0" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>Fetching "{screenId}"…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16 }}
      onLayout={() => {
        if (!wasCached && dataArrivedAt.current !== null && !viewBuildLogged.current) {
          viewBuildLogged.current = true;
          // eslint-disable-next-line no-console
          console.log(`[perf] nav_view_build_ms (${screenId}): ${Date.now() - dataArrivedAt.current}ms`);
        }
      }}
    >
      {screen.sections.map((node) => (
        <RenderNode key={node.id} node={node} />
      ))}
    </ScrollView>
  );
}

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
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <Pressable onPress={pop} style={{ marginBottom: 8 }}>
              <Text style={{ color: '#4B3AF0', fontWeight: '700', fontSize: 16 }}>{'< Back'}</Text>
            </Pressable>
          </View>
          <JsonDestination screenId={top.screenId} params={top.params} />
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
              maxHeight: '85%',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable onPress={closeSheet} hitSlop={8}>
                <Text style={{ fontSize: 22, color: '#111827' }}>{'‹'}</Text>
              </Pressable>
            </View>
            {activeSheet?.sheetId === 'location_picker' ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {buildLocationPickerSheet().map((node) => (
                  <RenderNode key={node.id} node={node} />
                ))}
              </ScrollView>
            ) : (
              <>
                <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 8 }}>Sheet: {activeSheet?.sheetId}</Text>
                {activeSheet?.params && (
                  <Text style={{ marginTop: 8, color: '#6B7280' }}>
                    {JSON.stringify(activeSheet.params)}
                  </Text>
                )}
                <Pressable onPress={closeSheet} style={{ marginTop: 20, alignSelf: 'flex-start' }}>
                  <Text style={{ color: '#4B3AF0', fontWeight: '700' }}>Close</Text>
                </Pressable>
              </>
            )}
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
