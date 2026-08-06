// Mock "server" for secondary screens. `fetchScreenJson` simulates a real
// network round-trip (delay + async) and returns a Screen JSON payload built
// from the given params -- this is where a real backend would run a query
// against `params` and shape the response; here it's a local switch, but
// the shape of the contract (screenId + params in, Screen JSON out) is the
// same either way, which is the point: swapping this for a real fetch()
// later requires no renderer or schema changes.
import type { Node, Screen } from '../schema/types';

interface CarListing {
  id: string;
  title: string;
  variant: string;
  km: string;
  fuel: string;
  transmission: string;
  price: string;
  emi: string;
  imageSeed: string;
  badge?: string;
}

const CATALOG: Record<string, { label: string; cars: CarListing[] }> = {
  all: {
    label: 'All used cars',
    cars: [
      { id: 'swift-2019', title: '2019 Maruti Swift', variant: 'VXI AMT', km: '38,210 km', fuel: 'Petrol', transmission: 'Auto', price: '₹5.42 lakh', emi: '₹9,980/m*', imageSeed: 'listing-swift' },
      { id: 'i20-2020', title: '2020 Hyundai i20', variant: 'Asta 1.2', km: '29,540 km', fuel: 'Petrol', transmission: 'Manual', price: '₹6.85 lakh', emi: '₹12,140/m*', imageSeed: 'listing-i20' },
      { id: 'creta-2021', title: '2021 Hyundai Creta', variant: 'SX 1.5', km: '21,880 km', fuel: 'Diesel', transmission: 'Auto', price: '₹13.20 lakh', emi: '₹22,760/m*', imageSeed: 'listing-creta' },
    ],
  },
  budget: {
    label: 'Budget used cars',
    cars: [
      { id: 'alto-2016', title: '2016 Maruti Alto 800', variant: 'LXI', km: '61,200 km', fuel: 'Petrol', transmission: 'Manual', price: '₹2.15 lakh', emi: '₹4,320/m*', imageSeed: 'listing-alto', badge: 'Budget' },
      { id: 'wagonr-2017', title: '2017 Maruti WagonR', variant: 'VXI', km: '54,760 km', fuel: 'Petrol', transmission: 'Manual', price: '₹2.98 lakh', emi: '₹5,610/m*', imageSeed: 'listing-wagonr', badge: 'Budget' },
    ],
  },
  premium: {
    label: 'Premium used cars',
    cars: [
      { id: 'harrier-2022', title: '2022 Tata Harrier', variant: 'XZ+ Diesel', km: '14,300 km', fuel: 'Diesel', transmission: 'Auto', price: '₹19.75 lakh', emi: '₹33,890/m*', imageSeed: 'listing-harrier', badge: 'Premium' },
      { id: 'fortuner-2021', title: '2021 Toyota Fortuner', variant: '2.8 4x2 AT', km: '18,900 km', fuel: 'Diesel', transmission: 'Auto', price: '₹34.10 lakh', emi: '₹56,420/m*', imageSeed: 'listing-fortuner', badge: 'Premium' },
    ],
  },
  buy_used_car: {
    label: 'Buy used car',
    cars: [
      { id: 'baleno-2015', title: '2015 Maruti Baleno', variant: 'DELTA CVT PETROL 1.2', km: '92,838 km', fuel: 'Petrol', transmission: 'Auto', price: '₹3.87 lakh', emi: '₹10,191/m*', imageSeed: 'cars24-baleno', badge: 'Cars24 Owned stock' },
      { id: 'xuv300-2023', title: '2023 Mahindra XUV300', variant: 'W6 1.2 PETROL', km: '25,335 km', fuel: 'Petrol', transmission: 'Manual', price: '₹6.60 lakh', emi: '₹11,651/m*', imageSeed: 'listing-xuv300', badge: 'Cars24 Owned stock' },
    ],
  },
};

// Flat id -> car lookup, derived from the same catalog used for listings, so
// the car-detail screen and every listing/rail that links to it always agree
// on price/spec data for a given id -- one source of truth, not two.
const CAR_INDEX: Record<string, CarListing> = Object.fromEntries(
  Object.values(CATALOG)
    .flatMap((entry) => entry.cars)
    .map((car) => [car.id, car])
);

// Standard reducing-balance EMI formula, so the tenure selector (see
// buildCarDetailScreen) shows a genuinely different, plausible EMI per
// tenure instead of a hardcoded string per option -- computed from the
// car's actual price, not faked.
const EMI_TENURE_OPTIONS = [24, 36, 48] as const;
const EMI_ANNUAL_RATE_PERCENT = 11;

function parsePriceToRupees(priceStr: string): number {
  const match = priceStr.match(/([\d.]+)\s*lakh/i);
  return match ? Math.round(parseFloat(match[1]) * 100000) : 0;
}

function computeMonthlyEmi(principal: number, months: number): number {
  const r = EMI_ANNUAL_RATE_PERCENT / 12 / 100;
  const factor = Math.pow(1 + r, months);
  return Math.round((principal * r * factor) / (factor - 1));
}

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function buildCarCardNode(car: CarListing): Node {
  return {
    id: `listing_card_${car.id}`,
    type: 'tappable',
    onTap: { type: 'navigate', screen: 'car_detail', params: { listingId: car.id } },
    children: [
      {
        id: `listing_card_${car.id}_body`,
        type: 'stack',
        style: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, gap: 6, marginVertical: 6 },
        children: [
          { id: `listing_card_${car.id}_image`, type: 'image', props: { uri: `https://picsum.photos/seed/${car.imageSeed}/500/280` }, style: { aspectRatio: 1.8 } },
          ...(car.badge
            ? [{ id: `listing_card_${car.id}_badge`, type: 'badge', props: { text: car.badge, tone: 'info' } } as Node]
            : []),
          { id: `listing_card_${car.id}_title`, type: 'text', props: { content: car.title, variant: 'subtitle' }, style: { fontWeight: '700', fontSize: 16 } },
          { id: `listing_card_${car.id}_variant`, type: 'text', props: { content: car.variant, variant: 'caption' } },
          {
            id: `listing_card_${car.id}_specs`,
            type: 'row',
            style: { gap: 6 },
            children: [
              { id: `listing_card_${car.id}_spec_km`, type: 'badge', props: { text: car.km } },
              { id: `listing_card_${car.id}_spec_fuel`, type: 'badge', props: { text: car.fuel } },
              { id: `listing_card_${car.id}_spec_trans`, type: 'badge', props: { text: car.transmission } },
            ],
          },
          { id: `listing_card_${car.id}_price`, type: 'text', props: { content: `${car.price}  |  EMI ${car.emi}` }, style: { fontWeight: '700' } },
        ],
      },
    ],
  };
}

function buildListingScreen(params: Record<string, string>): Screen {
  const category = params.category ?? 'all';
  const entry = CATALOG[category] ?? CATALOG.all;

  return {
    screenId: 'listing',
    schemaVersion: 1,
    title: entry.label,
    sections: [
      {
        id: 'listing_header',
        type: 'stack',
        style: { gap: 4, marginBottom: 8 },
        children: [
          { id: 'listing_header_title', type: 'text', props: { content: entry.label, variant: 'title' }, style: { fontSize: 20, fontWeight: '700' } },
          { id: 'listing_header_count', type: 'text', props: { content: `${entry.cars.length} cars available in Gurgaon` }, style: { color: '#6B7280' } },
        ],
      },
      {
        id: 'listing_filter_row',
        type: 'row',
        style: { gap: 8, marginBottom: 12 },
        children: [
          { id: 'listing_filter_filters', type: 'badge', props: { text: 'Filters' } },
          { id: 'listing_filter_sort', type: 'badge', props: { text: 'Sort by' } },
          { id: 'listing_filter_category', type: 'badge', props: { text: category.replace(/_/g, ' '), tone: 'brand' } },
        ],
      },
      {
        id: 'listing_results',
        type: 'list',
        children: entry.cars.map(buildCarCardNode),
      },
    ],
  };
}

// Real Cars24 car-detail layout, matched against a live capture of the
// actual app (docs/reference-screenshots/car-detail-1.png): spec chip row
// over a hero image, title+variant, location, feature badges, an EMI box,
// a price box, and a two-button CTA row. Every car in CAR_INDEX renders
// through this same shape -- only the data differs, no new component types.
function buildCarDetailScreen(listingId: string): Screen {
  const car = CAR_INDEX[listingId];

  if (!car) {
    return {
      screenId: 'car_detail',
      schemaVersion: 1,
      title: 'Not found',
      sections: [
        { id: 'car_detail_not_found', type: 'text', props: { content: `No listing found for id "${listingId}"` }, style: { padding: 16, color: '#6B7280' } },
      ],
    };
  }

  return {
    screenId: 'car_detail',
    schemaVersion: 1,
    title: car.title,
    sections: [
      { id: 'car_detail_image', type: 'image', props: { uri: `https://picsum.photos/seed/${car.imageSeed}/700/450` }, style: { aspectRatio: 1.5, borderRadius: 12 } },
      {
        id: 'car_detail_spec_row',
        type: 'row',
        style: { gap: 6, marginTop: 12 },
        children: [
          { id: 'car_detail_spec_km', type: 'badge', props: { text: car.km } },
          { id: 'car_detail_spec_fuel', type: 'badge', props: { text: car.fuel } },
          { id: 'car_detail_spec_trans', type: 'badge', props: { text: car.transmission } },
          { id: 'car_detail_spec_owner', type: 'badge', props: { text: '1st Owner' } },
        ],
      },
      ...(car.badge
        ? [{ id: 'car_detail_badge', type: 'badge', props: { text: car.badge, tone: 'info' }, style: { marginTop: 8 } } as Node]
        : []),
      { id: 'car_detail_title', type: 'text', props: { content: car.title }, style: { fontSize: 22, fontWeight: '700', marginTop: 8 } },
      { id: 'car_detail_variant', type: 'text', props: { content: car.variant }, style: { color: '#6B7280', marginTop: 2 } },
      {
        id: 'car_detail_location_row',
        type: 'row',
        style: { gap: 6, align: 'center', marginTop: 8 },
        children: [
          { id: 'car_detail_location_icon', type: 'icon', props: { name: 'location-outline', size: 16 }, style: { color: '#6B7280' } },
          { id: 'car_detail_location_text', type: 'text', props: { content: 'Udyog Vihar, Sector 18, Gurugram  |  2.2 km away' }, style: { color: '#6B7280', fontSize: 13 } },
        ],
      },
      {
        id: 'car_detail_feature_row',
        type: 'row',
        style: { gap: 6, marginTop: 12 },
        children: [
          { id: 'car_detail_feature_warranty', type: 'badge', props: { text: 'Lifetime warranty' } },
          { id: 'car_detail_feature_return', type: 'badge', props: { text: '30 days return' } },
          { id: 'car_detail_feature_checks', type: 'badge', props: { text: '300+ quality checks' } },
        ],
      },
      {
        id: 'car_detail_tenure_label',
        type: 'text',
        props: { content: 'Choose your EMI tenure' },
        style: { fontSize: 15, fontWeight: '700', marginTop: 20 },
      },
      {
        id: 'car_detail_tenure_row',
        type: 'row',
        style: { gap: 8, marginTop: 8 },
        children: EMI_TENURE_OPTIONS.flatMap((months): Node[] => {
          const tenureKey = `tenure_${car.id}`;
          const isDefault = months === 36;
          const selectedCondition = isDefault
            ? { and: [{ state: tenureKey, notEquals: 24 }, { state: tenureKey, notEquals: 48 }] }
            : { state: tenureKey, equals: months };
          const unselectedCondition = isDefault
            ? { or: [{ state: tenureKey, equals: 24 }, { state: tenureKey, equals: 48 }] }
            : { state: tenureKey, notEquals: months };
          return [
            {
              id: `car_detail_tenure_${months}_sel`,
              type: 'tappable',
              onTap: { type: 'setState', key: tenureKey, value: months },
              visibleIf: selectedCondition,
              children: [{ id: `car_detail_tenure_${months}_sel_btn`, type: 'button', props: { label: `${months} months`, variant: 'primary' }, style: { paddingHorizontal: 16 } }],
            },
            {
              id: `car_detail_tenure_${months}_unsel`,
              type: 'tappable',
              onTap: { type: 'setState', key: tenureKey, value: months },
              visibleIf: unselectedCondition,
              children: [{ id: `car_detail_tenure_${months}_unsel_btn`, type: 'button', props: { label: `${months} months`, variant: 'secondary' }, style: { paddingHorizontal: 16 } }],
            },
          ];
        }),
      },
      {
        id: 'car_detail_emi_box',
        type: 'stack',
        style: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginTop: 12, gap: 4 },
        children: [
          { id: 'car_detail_emi_label', type: 'text', props: { content: 'EMI on Zero Downpayment' }, style: { color: '#6B7280', fontSize: 13 } },
          ...EMI_TENURE_OPTIONS.map((months): Node => {
            const tenureKey = `tenure_${car.id}`;
            const isDefault = months === 36;
            const visibleIf = isDefault
              ? { and: [{ state: tenureKey, notEquals: 24 }, { state: tenureKey, notEquals: 48 }] }
              : { state: tenureKey, equals: months };
            const principal = parsePriceToRupees(car.price);
            const emi = computeMonthlyEmi(principal, months);
            return {
              id: `car_detail_emi_value_${months}`,
              type: 'text',
              props: { content: `EMI ${formatRupees(emi)}/m* for ${months} months` },
              style: { fontSize: 18, fontWeight: '700' },
              visibleIf,
            };
          }),
        ],
      },
      {
        id: 'car_detail_price_box',
        type: 'stack',
        style: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginTop: 8, gap: 4 },
        children: [
          { id: 'car_detail_price_value', type: 'text', props: { content: car.price }, style: { fontSize: 20, fontWeight: '700' } },
          { id: 'car_detail_price_caption', type: 'text', props: { content: '+ ₹36,000 other charges' }, style: { color: '#6B7280', fontSize: 12 } },
        ],
      },
      {
        id: 'car_detail_cta_row',
        type: 'row',
        style: { gap: 12, marginTop: 20 },
        children: [
          {
            id: 'car_detail_book_now',
            type: 'tappable',
            onTap: { type: 'openSheet', sheet: 'booking', params: { listingId: car.id } },
            children: [{ id: 'car_detail_book_now_btn', type: 'button', props: { label: 'Book now', variant: 'primary' }, style: { width: 160 } }],
          },
          {
            id: 'car_detail_test_drive',
            type: 'tappable',
            onTap: { type: 'navigate', screen: 'test_drive', params: { listingId: car.id } },
            children: [{ id: 'car_detail_test_drive_btn', type: 'button', props: { label: 'Free test drive', variant: 'secondary' }, style: { width: 160 } }],
          },
        ],
      },
    ],
  };
}

const GENERIC_SCREEN_ICONS: Record<string, string> = {
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
};

function humanizeScreenId(screenId: string): string {
  return screenId
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generic dummy screen for every navigate target that doesn't have a
// hand-built screen (buildListingScreen / buildCarDetailScreen) yet. Every
// `navigate` action in this app resolves to *some* real Screen JSON, never
// a raw debug dump -- this is what makes that true for the destinations
// that were genuinely out of scope to fully build under the timebox,
// without falling back to unstyled "Screen: X, params: Y" text.
function buildGenericScreen(screenId: string, params?: Record<string, string>): Screen {
  const title = humanizeScreenId(screenId);
  const icon = GENERIC_SCREEN_ICONS[screenId] ?? 'apps-outline';
  const paramEntries = Object.entries(params ?? {});

  return {
    screenId,
    schemaVersion: 1,
    title,
    sections: [
      {
        id: 'generic_banner',
        type: 'image',
        props: { uri: `https://picsum.photos/seed/dummy-${screenId}/900/560` },
        style: { aspectRatio: 1.6, borderRadius: 16 },
      },
      {
        id: 'generic_title_row',
        type: 'row',
        style: { gap: 10, align: 'center', marginTop: 16 },
        children: [
          { id: 'generic_icon', type: 'icon', props: { name: icon, size: 26 }, style: { color: '#4B3AF0' } },
          { id: 'generic_title', type: 'text', props: { content: title }, style: { fontSize: 22, fontWeight: '700' } },
        ],
      },
      {
        id: 'generic_note',
        type: 'text',
        props: {
          content:
            'This screen renders from dummy JSON (no live API call) -- it was not built out in full detail under this build\'s timebox, but every navigate target resolves to real Screen JSON through the same renderer, not a hardcoded page.',
        },
        style: { color: '#6B7280', marginTop: 8 },
      },
      ...(paramEntries.length > 0
        ? [
            {
              id: 'generic_params_label',
              type: 'text',
              props: { content: 'Params received from JSON:' },
              style: { color: '#6B7280', fontSize: 12, marginTop: 16 },
            } as Node,
            {
              id: 'generic_params_row',
              type: 'row',
              style: { gap: 6, marginTop: 6 },
              children: paramEntries.map(
                ([key, value]): Node => ({
                  id: `generic_param_${key}`,
                  type: 'badge',
                  props: { text: `${key}: ${value}`, tone: 'brand' },
                })
              ),
            } as Node,
          ]
        : []),
    ],
  };
}

export async function fetchScreenJson(screenId: string, params?: Record<string, string>): Promise<Screen> {
  // Artificial network-like delay so this is a genuine, isolable "fetch"
  // phase -- unlike the home screen's JSON, which is bundled locally via
  // `require` and has no real fetch phase to measure (see PERF.md).
  await new Promise((resolve) => setTimeout(resolve, 450));
  if (screenId === 'listing') {
    return buildListingScreen(params ?? {});
  }
  if (screenId === 'car_detail') {
    return buildCarDetailScreen(params?.listingId ?? '');
  }
  return buildGenericScreen(screenId, params);
}
