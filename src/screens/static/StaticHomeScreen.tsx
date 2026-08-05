// Static (hardcoded) twin of the SDUI home screen -- same visual content,
// same interactions, but every section is plain JSX written directly in
// this file. No JSON parsing, no component registry, no action dispatch.
// This exists purely as the Part 2 perf baseline to compare against the
// SDUI-rendered version.
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { mark } from '../../perf/timing';
import { createFrameJankTracker } from '../../perf/scrollJank';
import { runAfterPaint } from '../../perf/runAfterPaint';

const topPad = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 44;

// Purely local/hardcoded -- no JSON, no server call, matching this screen's
// whole point as the zero-JSON perf baseline. A plain string-formatting
// helper, not a schema/renderer dependency, so it doesn't compromise that.
const NAV_SCREEN_ICONS: Record<string, string> = {
  add_vehicle: 'car-outline',
  cash_against_car: 'cash-outline',
  challan_payment: 'receipt-outline',
  crashfree_india: 'shield-outline',
  fastag_recharge: 'card-outline',
  insurance: 'shield-checkmark-outline',
  new_car_detail: 'car-sport-outline',
  new_cars: 'car-sport-outline',
  profile: 'person-circle-outline',
  return_policy: 'refresh-circle-outline',
  roadside_assistance: 'alert-circle-outline',
  search: 'search-outline',
  showroom_detail: 'business-outline',
  test_drive: 'speedometer-outline',
  warranty: 'shield-checkmark-outline',
  listing: 'list-outline',
  car_detail: 'car-outline',
};

function humanizeScreenId(screenId: string): string {
  return screenId
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

mark('static_module_eval_done');
const jank = createFrameJankTracker();

export function StaticHomeScreen() {
  const [activeTab, setActiveTab] = useState('all');
  const [navScreen, setNavScreen] = useState<{ id: string; params?: Record<string, string> } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const mountStart = useRef(Date.now()).current;

  useEffect(() => {
    mark('static_mount_committed');
    runAfterPaint(() => {
      mark('static_interactions_ready');
    });
    // eslint-disable-next-line no-console
    console.log(`[perf] static_mount_to_commit: ${Date.now() - mountStart}ms`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = (id: string, params?: Record<string, string>) => setNavScreen({ id, params });
  const call = (phone: string) => Linking.openURL(`tel:${phone}`).catch(() => {});
  const openUrl = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad }}
        onLayout={() => mark('static_first_layout')}
        onScrollBeginDrag={() => jank.start()}
        onScrollEndDrag={() => {
          const { droppedFrames, totalFrames } = jank.stop();
          // eslint-disable-next-line no-console
          console.log(`[perf] static_scroll_jank: ${droppedFrames} dropped / ${totalFrames} frames`);
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Pressable onPress={() => setSheetOpen(true)} style={styles.row}>
              <Ionicons name="location" size={18} color="#fff" />
              <Text style={styles.locationText}>Gurgaon</Text>
              <Ionicons name="chevron-down" size={16} color="#fff" />
            </Pressable>
            <Pressable onPress={() => navigate('profile')}>
              <Ionicons name="person-circle" size={32} color="#fff" />
            </Pressable>
          </View>
          <Pressable onPress={() => navigate('search')} style={styles.searchRow}>
            <Ionicons name="search" size={18} color="#E4E1FA" />
            <Text style={{ color: '#E4E1FA' }}>Search Thar</Text>
          </Pressable>
        </View>

        {/* Category tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow} contentContainerStyle={{ gap: 8 }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'buy', label: 'Buy used car', screen: 'listing', params: { category: 'buy_used_car' } },
            { key: 'sell', label: 'Sell car', screen: 'sell' },
            { key: 'loans', label: 'Loans', screen: 'loans' },
            { key: 'challan', label: 'Challan', screen: 'challan' },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => (tab.key === 'all' ? setActiveTab('all') : navigate(tab.screen!, tab.params))}
              style={[styles.chip, activeTab === tab.key && tab.key === 'all' ? styles.chipSelected : styles.chipUnselected]}
            >
              <Text style={{ color: activeTab === tab.key && tab.key === 'all' ? '#4B3AF0' : '#fff', fontWeight: '600' }}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Buy car rail */}
        <View style={styles.section}>
          <View style={styles.rowCenter}>
            <Text style={styles.title}>Buy car</Text>
            <View style={styles.badgeDanger}>
              <Text style={styles.badgeText}>Up to ₹80,000 off</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
            {[
              { key: 'all', label: 'All used cars', seed: 'cars24-orange', params: { category: 'all' } },
              { key: 'budget', label: 'Budget used cars', seed: 'cars24-white', params: { category: 'budget' } },
              { key: 'premium', label: 'Premium used cars', seed: 'cars24-yellow', params: { category: 'premium' } },
            ].map((card) => (
              <Pressable key={card.key} onPress={() => navigate('listing', card.params)} style={styles.buyCard}>
                <Text style={styles.buyCardText}>{card.label}</Text>
                <Image
                  source={{ uri: `https://picsum.photos/seed/${card.seed}/400/250` }}
                  style={styles.buyCardImage}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Car listings rail */}
        <View style={styles.section}>
          <Text style={styles.title}>Best deals for you</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
            <Pressable
              onPress={() => navigate('car_detail', { listingId: 'baleno-2015' })}
              style={styles.carCard}
            >
              <Image
                source={{ uri: 'https://picsum.photos/seed/cars24-baleno/400/250' }}
                style={styles.carCardImage}
                resizeMode="cover"
              />
              <View style={styles.badgeInfo}>
                <Text style={styles.badgeText}>Cars24 Owned stock</Text>
              </View>
              <Text style={styles.carCardTitle}>2015 Maruti Baleno</Text>
              <Text style={styles.caption}>DELTA CVT PETROL 1.2</Text>
              <View style={[styles.row, { gap: 6 }]}>
                {['92,838 km', 'Petrol', 'Auto'].map((spec) => (
                  <View key={spec} style={styles.badgeInfo}>
                    <Text style={styles.badgeText}>{spec}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.price}>₹3.87 lakh  |  EMI ₹10,191/m*</Text>
              <View style={styles.spaceBetween}>
                <Pressable onPress={() => navigate('test_drive', { listingId: 'baleno-2015' })}>
                  <Text style={styles.linkText}>Free Test Drive</Text>
                </Pressable>
                <Pressable onPress={() => navigate('car_detail', { listingId: 'baleno-2015' })}>
                  <Text style={styles.linkText}>View Details</Text>
                </Pressable>
              </View>
            </Pressable>
          </ScrollView>
        </View>

        {/* Manage your vehicle grid */}
        <View style={[styles.section, { backgroundColor: '#4B3AF0' }]}>
          <View style={styles.spaceBetween}>
            <Text style={[styles.title, { color: '#fff' }]}>Manage your vehicle</Text>
            <Pressable onPress={() => navigate('add_vehicle')}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>+ Add vehicle</Text>
            </Pressable>
          </View>
          <View style={styles.grid}>
            {[
              { key: 'challan', label: 'Pay challan', icon: 'receipt-outline', screen: 'challan_payment' },
              { key: 'fastag', label: 'Recharge FASTag', icon: 'card-outline', screen: 'fastag_recharge' },
              { key: 'insurance', label: 'Get insurance', icon: 'shield-checkmark-outline', screen: 'insurance' },
              { key: 'cash', label: 'Cash against car', icon: 'cash-outline', screen: 'cash_against_car' },
              { key: 'roadside', label: 'Road side assistance', icon: 'alert-circle-outline', screen: 'roadside_assistance' },
              { key: 'warranty', label: 'Get warranty', icon: 'shield-outline', screen: 'warranty' },
            ].map((svc) => (
              <View key={svc.key} style={styles.gridItem}>
                <Pressable onPress={() => navigate(svc.screen)} style={styles.gridCard}>
                  <Text style={{ fontWeight: '700' }}>{svc.label}</Text>
                  <Ionicons name={svc.icon as keyof typeof Ionicons.glyphMap} size={28} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Promo banner */}
        <Pressable onPress={() => openUrl('https://cars24.com/orbit')} style={styles.promoBanner}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Add your car to Orbit</Text>
          <Text style={{ color: '#D1E7DD', marginTop: 4 }}>Enjoy 3-months Spotify Premium free</Text>
          <View style={[styles.buttonSecondary, { marginTop: 8, alignSelf: 'flex-start' }]}>
            <Text style={{ color: '#4B3AF0', fontWeight: '600' }}>Add car now</Text>
          </View>
        </Pressable>

        {/* Showrooms rail */}
        <View style={styles.section}>
          <Text style={styles.title}>2 showrooms in your city</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
            {[
              { key: 'udyog-vihar', name: 'Udyog Vihar, Sector 18, Gurugram', meta: '50+ cars  |  2.2 km away  |  Open, closes 09:00 PM', phone: '+911244567890', seed: 'cars24-showroom-1' },
              { key: 'm3m-urbana', name: 'M3M Urbana, Golf Course Rd', meta: '290+ cars  |  8.9 km away  |  Open', phone: '+911244567891', seed: 'cars24-showroom-2' },
            ].map((sr) => (
              <View key={sr.key} style={styles.showroomCard}>
                <Image source={{ uri: `https://picsum.photos/seed/${sr.seed}/400/220` }} style={styles.showroomImage} resizeMode="cover" />
                <Text style={{ fontWeight: '700' }}>{sr.name}</Text>
                <Text style={styles.caption}>{sr.meta}</Text>
                <View style={[styles.row, { gap: 8 }]}>
                  <Pressable onPress={() => call(sr.phone)} style={styles.buttonSecondary}>
                    <Text style={{ color: '#4B3AF0', fontWeight: '600' }}>Call us now</Text>
                  </Pressable>
                  <Pressable onPress={() => navigate('showroom_detail', { showroomId: sr.key })} style={styles.buttonPrimary}>
                    <Text style={{ color: '#fff', fontWeight: '600' }}>View showroom</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Trending cars rail */}
        <View style={styles.section}>
          <View style={styles.spaceBetween}>
            <Text style={styles.title}>Trending new cars</Text>
            <Pressable onPress={() => navigate('new_cars')}>
              <Text style={{ color: '#4B3AF0', fontWeight: '700' }}>View all</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
            {[
              { key: 'seltos', name: 'Seltos', seed: 'cars24-seltos' },
              { key: 'sonet', name: 'Sonet', seed: 'cars24-sonet' },
              { key: 'syros', name: 'Syros', seed: 'cars24-syros' },
            ].map((car) => (
              <Pressable key={car.key} onPress={() => navigate('new_car_detail', { model: car.key })} style={styles.trendingCard}>
                <Text style={{ fontWeight: '700' }}>{car.name}</Text>
                <Text style={styles.caption}>Kia</Text>
                <Image source={{ uri: `https://picsum.photos/seed/${car.seed}/300/200` }} style={styles.trendingImage} resizeMode="cover" />
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Marketing banner carousel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingVertical: 12 }} contentContainerStyle={{ gap: 12 }}>
          <Pressable onPress={() => navigate('return_policy')} style={[styles.valueProp, { backgroundColor: '#4338CA' }]}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>30 Day Return Guarantee</Text>
            <Text style={{ color: '#E0E7FF', marginTop: 4 }}>We take it back as easily as we deliver it</Text>
            <View style={[styles.buttonSecondary, { marginTop: 8, alignSelf: 'flex-start' }]}>
              <Text style={{ color: '#4B3AF0', fontWeight: '600' }}>Know more</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => navigate('crashfree_india')} style={[styles.valueProp, { backgroundColor: '#4F46E5' }]}>
            <Text style={{ color: '#FDE68A', fontWeight: '700', fontSize: 12 }}>CRASHFREE INDIA</Text>
            <Text style={{ color: '#fff', fontWeight: '700', marginTop: 4 }}>Control. Judgment. Patience.</Text>
            <View style={[styles.buttonSecondary, { marginTop: 8, alignSelf: 'flex-start' }]}>
              <Text style={{ color: '#4B3AF0', fontWeight: '600' }}>Explore now</Text>
            </View>
          </Pressable>
        </ScrollView>

        <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 }} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>better drives, better lives</Text>
          <Text style={{ color: '#E4E1FA', marginTop: 8 }}>Made with ❤️ in Gurugram</Text>
        </View>
      </ScrollView>

      {navScreen && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', paddingTop: topPad }]}>
          <View style={{ padding: 16 }}>
            <Pressable onPress={() => setNavScreen(null)} style={{ marginBottom: 8 }}>
              <Text style={{ color: '#4B3AF0', fontWeight: '700', fontSize: 16 }}>{'< Back'}</Text>
            </Pressable>
            <View style={{ alignItems: 'center', marginTop: 24 }}>
              <Ionicons
                name={(NAV_SCREEN_ICONS[navScreen.id] ?? 'apps-outline') as keyof typeof Ionicons.glyphMap}
                size={56}
                color="#4B3AF0"
              />
              <Text style={{ fontSize: 22, fontWeight: '700', marginTop: 16 }}>
                {humanizeScreenId(navScreen.id)}
              </Text>
              <Text style={{ color: '#6B7280', marginTop: 8, textAlign: 'center' }}>
                Dummy content, hardcoded directly in this screen -- no JSON, no server call. That's
                the point of the static twin: this is the zero-SDUI-overhead baseline.
              </Text>
              {navScreen.params && (
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {Object.entries(navScreen.params).map(([key, value]) => (
                    <View key={key} style={{ backgroundColor: '#EDE9FE', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 12, color: '#374151' }}>{key}: {value}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, minHeight: 200 }}>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>Sheet: location_picker</Text>
            <Pressable onPress={() => setSheetOpen(false)} style={{ marginTop: 20, alignSelf: 'flex-start' }}>
              <Text style={{ color: '#4B3AF0', fontWeight: '700' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#4B3AF0', padding: 16, gap: 12 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  spaceBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationText: { color: '#fff', fontWeight: '700' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6C5CE7',
    borderRadius: 24,
    padding: 12,
  },
  tabsRow: { backgroundColor: '#4B3AF0', paddingHorizontal: 16, paddingVertical: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  chipSelected: { backgroundColor: '#fff' },
  chipUnselected: { backgroundColor: 'rgba(255,255,255,0.15)' },
  section: { padding: 16, gap: 12 },
  title: { fontSize: 18, fontWeight: '700' },
  caption: { color: '#6B7280', fontSize: 12 },
  badgeDanger: { backgroundColor: '#FEE2E2', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeInfo: { backgroundColor: '#E0E7FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, color: '#374151' },
  buyCard: { backgroundColor: '#1E3A8A', borderRadius: 12, padding: 16, width: 160 },
  buyCardText: { color: '#fff', fontWeight: '700' },
  buyCardImage: { width: '100%', aspectRatio: 1.6, marginVertical: 8, backgroundColor: '#E5E7EB' },
  carCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, width: 280, gap: 6 },
  carCardImage: { width: '100%', aspectRatio: 1.7, backgroundColor: '#E5E7EB' },
  carCardTitle: { fontWeight: '700', fontSize: 16 },
  price: { fontWeight: '700' },
  linkText: { color: '#4B3AF0', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '33.33%', padding: 4 },
  gridCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, gap: 4 },
  promoBanner: { backgroundColor: '#0F5132', borderRadius: 16, padding: 20, margin: 16 },
  showroomCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, width: 300, gap: 6, padding: 12 },
  showroomImage: { width: '100%', aspectRatio: 1.8, borderRadius: 8, backgroundColor: '#E5E7EB' },
  buttonSecondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#4B3AF0', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' },
  buttonPrimary: { backgroundColor: '#4B3AF0', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' },
  trendingCard: { backgroundColor: '#F3F4F6', borderRadius: 12, width: 150, padding: 12, gap: 4 },
  trendingImage: { width: '100%', aspectRatio: 1.4, marginVertical: 8, backgroundColor: '#E5E7EB' },
  valueProp: { borderRadius: 16, padding: 20, width: 320 },
  footer: { backgroundColor: '#6C5CE7', padding: 24 },
});
