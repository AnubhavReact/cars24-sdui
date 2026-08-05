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
      { id: 'baleno-2015b', title: '2015 Maruti Baleno', variant: 'DELTA CVT PETROL 1.2', km: '92,838 km', fuel: 'Petrol', transmission: 'Auto', price: '₹3.87 lakh', emi: '₹10,191/m*', imageSeed: 'cars24-baleno', badge: 'Cars24 Owned stock' },
      { id: 'xuv300-2023', title: '2023 Mahindra XUV300', variant: 'W6 1.2 PETROL', km: '25,335 km', fuel: 'Petrol', transmission: 'Manual', price: '₹6.60 lakh', emi: '₹11,651/m*', imageSeed: 'listing-xuv300', badge: 'Cars24 Owned stock' },
    ],
  },
};

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

export async function fetchScreenJson(screenId: string, params?: Record<string, string>): Promise<Screen> {
  // Artificial network-like delay so this is a genuine, isolable "fetch"
  // phase -- unlike the home screen's JSON, which is bundled locally via
  // `require` and has no real fetch phase to measure (see PERF.md).
  await new Promise((resolve) => setTimeout(resolve, 450));
  if (screenId === 'listing') {
    return buildListingScreen(params ?? {});
  }
  throw new Error(`No mock screen registered for screenId "${screenId}"`);
}
