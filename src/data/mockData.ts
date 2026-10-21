import { Trip, Receipt } from '../types';
import { convertToEUR } from '../utils/currencies';

// Helper to create realistic SVG receipt data URLs
export function createSvgReceipt(
  merchant: string,
  date: string,
  amount: string,
  items: Array<{ name: string; price: string }>,
  tax: string,
  receiptNo: string,
  currencySymbol: string = '€'
): string {
  const rows = items
    .map(
      (item, i) =>
        `<text x="20" y="${170 + i * 24}" font-family="monospace" font-size="12" fill="#333">${item.name.padEnd(22, ' ')}</text>
         <text x="280" y="${170 + i * 24}" font-family="monospace" font-size="12" text-anchor="end" fill="#111" font-weight="bold">${item.price}</text>`
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420">
    <defs>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.15"/>
      </filter>
    </defs>
    <!-- Paper receipt background with jagged edges -->
    <rect x="5" y="5" width="290" height="410" rx="4" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.5" filter="url(#shadow)"/>
    <line x1="15" y1="50" x2="285" y2="50" stroke="#cbd5e1" stroke-dasharray="4 4" stroke-width="1"/>
    
    <!-- Merchant Header -->
    <text x="150" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="bold" text-anchor="middle" fill="#0f172a">${merchant.slice(0, 26)}</text>
    <text x="150" y="44" font-family="monospace" font-size="9" text-anchor="middle" fill="#64748b">RECEIPT &amp; EXPENSE VOUCHER</text>
    
    <!-- Meta Info -->
    <text x="20" y="75" font-family="monospace" font-size="11" fill="#475569">DATE: <tspan font-weight="bold" fill="#0f172a">${date}</tspan></text>
    <text x="20" y="95" font-family="monospace" font-size="11" fill="#475569">NO: <tspan fill="#0f172a">${receiptNo}</tspan></text>
    <text x="20" y="115" font-family="monospace" font-size="11" fill="#475569">PAYMENT: <tspan fill="#0f172a">VISA **** 4892</tspan></text>
    <text x="20" y="135" font-family="monospace" font-size="11" fill="#475569">STATUS: <tspan fill="#15803d" font-weight="bold">APPROVED</tspan></text>
    
    <line x1="15" y1="148" x2="285" y2="148" stroke="#cbd5e1" stroke-width="1"/>
    
    <!-- Items list -->
    ${rows}
    
    <!-- Totals -->
    <line x1="15" y1="300" x2="285" y2="300" stroke="#0f172a" stroke-width="1.5"/>
    <text x="20" y="322" font-family="monospace" font-size="11" fill="#475569">SUBTOTAL</text>
    <text x="280" y="322" font-family="monospace" font-size="11" text-anchor="end" fill="#0f172a">${currencySymbol} ${(parseFloat(amount) - parseFloat(tax || '0')).toFixed(2)}</text>
    
    <text x="20" y="342" font-family="monospace" font-size="11" fill="#475569">VAT / TAX INCLUDED</text>
    <text x="280" y="342" font-family="monospace" font-size="11" text-anchor="end" fill="#0f172a">${currencySymbol} ${tax}</text>
    
    <rect x="15" y="354" width="270" height="36" fill="#0f172a" rx="4"/>
    <text x="28" y="377" font-family="-apple-system, sans-serif" font-size="13" font-weight="bold" fill="#ffffff">TOTAL PAID</text>
    <text x="272" y="377" font-family="monospace" font-size="16" font-weight="bold" text-anchor="end" fill="#38bdf8">${currencySymbol} ${amount}</text>
    
    <!-- Barcode decoration -->
    <text x="150" y="404" font-family="monospace" font-size="9" text-anchor="middle" fill="#94a3b8">|| | | |||| ||| || |||| | ||| |||</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_RECEIPTS = [
  {
    id: 'sample-1',
    name: 'Business Dinner - Le Gabriel',
    merchant: 'Le Gabriel Paris',
    date: '2026-10-13',
    amount: 74.5,
    currency: 'EUR',
    category: 'MEALS' as const,
    taxAmount: 14.9,
    receiptNumber: 'REC-PAR-9041',
    description: 'Dinner with client executive team',
    image: createSvgReceipt(
      'Le Gabriel Paris',
      '2026-10-13',
      '74.50',
      [
        { name: 'Menu Découverte', price: '48.00' },
        { name: 'San Pellegrino 1L', price: '6.50' },
        { name: 'Café Espresso x2', price: '8.00' },
        { name: 'Fromages Affinés', price: '12.00' },
      ],
      '14.90',
      'REC-PAR-9041',
      '€'
    ),
  },
  {
    id: 'sample-2',
    name: 'London Black Cab - City Center',
    merchant: 'London Black Cabs Ltd',
    date: '2026-10-14',
    amount: 38.0,
    currency: 'GBP',
    category: 'TRANSPORT' as const,
    taxAmount: 6.33,
    receiptNumber: 'CAB-LON-109',
    description: 'Transfer from Heathrow to Canary Wharf',
    image: createSvgReceipt(
      'London Black Cabs Ltd',
      '2026-10-14',
      '38.00',
      [
        { name: 'Airport Pick-up Meter', price: '32.00' },
        { name: 'Terminal Toll Surcharge', price: '6.00' },
      ],
      '6.33',
      'CAB-LON-109',
      '£'
    ),
  },
  {
    id: 'sample-3',
    name: 'Novotel Canary Wharf (Lodging)',
    merchant: 'Novotel London Canary Wharf',
    date: '2026-10-14',
    amount: 245.0,
    currency: 'GBP',
    category: 'LODGING' as const,
    taxAmount: 40.83,
    receiptNumber: 'HTL-LON-4421',
    description: '1 Night Executive Room + Continental Breakfast',
    image: createSvgReceipt(
      'Novotel London Canary Wharf',
      '2026-10-14',
      '245.00',
      [
        { name: 'Standard Room Night', price: '215.00' },
        { name: 'City Tourist Tax', price: '8.00' },
        { name: 'Buffet Breakfast', price: '22.00' },
      ],
      '40.83',
      'HTL-LON-4421',
      '£'
    ),
  },
  {
    id: 'sample-4',
    name: 'TotalEnergies Highway Station',
    merchant: 'Station TotalEnergies A6',
    date: '2026-10-13',
    amount: 68.4,
    currency: 'EUR',
    category: 'FUEL' as const,
    taxAmount: 11.4,
    receiptNumber: 'TOT-88401',
    description: 'Full tank diesel for rental car',
    image: createSvgReceipt(
      'Station TotalEnergies A6',
      '2026-10-13',
      '68.40',
      [
        { name: 'Gazole Excellium 38L', price: '65.20' },
        { name: 'Lave-glace Hiver 1L', price: '3.20' },
      ],
      '11.40',
      'TOT-88401',
      '€'
    ),
  },
  {
    id: 'sample-5',
    name: '⚠️ OUT-OF-RANGE DATE (Nov 02 - Will trigger strict date error)',
    merchant: 'Bistrot de la Gare',
    date: '2026-11-02',
    amount: 32.5,
    currency: 'EUR',
    category: 'MEALS' as const,
    taxAmount: 5.4,
    receiptNumber: 'OUT-DATE-99',
    description: 'Receipt dated after trip end date to test date enforcement',
    image: createSvgReceipt(
      'Bistrot de la Gare',
      '2026-11-02',
      '32.50',
      [
        { name: 'Formule Déjeuner Express', price: '26.00' },
        { name: 'Café Gourmand', price: '6.50' },
      ],
      '5.40',
      'OUT-DATE-99',
      '€'
    ),
  },
  {
    id: 'sample-6',
    name: '❓ UNREADABLE DATE (Will trigger manual date entry modal)',
    merchant: 'Metropolitan Subway Ticket',
    date: '', // intentionally blank
    amount: 14.8,
    currency: 'EUR',
    category: 'TRANSPORT' as const,
    taxAmount: 1.48,
    receiptNumber: 'TKT-BLUR-01',
    description: 'Blurred ticket where date could not be parsed by OCR',
    image: createSvgReceipt(
      'Metropolitan Transit',
      '**/**/**** (BLURRED)',
      '14.80',
      [{ name: '10-Trip Transit Pass', price: '14.80' }],
      '1.48',
      'TKT-BLUR-01',
      '€'
    ),
  },
];

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trip-1',
    title: 'Client Architecture Audit & Strategy',
    destination: 'London, United Kingdom',
    startDate: '2026-10-12',
    endDate: '2026-10-15',
    status: 'DRAFT',
    employeeName: 'Alexandre Dumont',
    employeeEmail: 'a.dumont@corporate.com',
    employeeId: 'EMP-4091',
    department: 'Digital Solutions & Consulting',
    projectCode: 'PRJ-LONDON-2026',
    createdAt: '2026-10-10T09:00:00Z',
    receipts: [
      {
        id: 'rec-101',
        tripId: 'trip-1',
        merchant: 'Eurostar International Ltd',
        date: '2026-10-12',
        amount: 198.0,
        currency: 'EUR',
        category: 'TRANSPORT',
        taxAmount: 19.8,
        receiptNumber: 'EUR-883190',
        notes: 'Paris Nord - London St Pancras Standard Premier',
        imageUrl: createSvgReceipt(
          'Eurostar International Ltd',
          '2026-10-12',
          '198.00',
          [{ name: 'Train Ticket Standard', price: '198.00' }],
          '19.80',
          'EUR-883190',
          '€'
        ),
        createdAt: '2026-10-12T11:30:00Z',
        convertedAmountEUR: 198.0,
      },
      {
        id: 'rec-102',
        tripId: 'trip-1',
        merchant: 'Novotel London Canary Wharf',
        date: '2026-10-13',
        amount: 245.0,
        currency: 'GBP',
        category: 'LODGING',
        taxAmount: 40.83,
        receiptNumber: 'HTL-LON-4421',
        notes: 'Hotel accommodation 1 night',
        imageUrl: createSvgReceipt(
          'Novotel London Canary Wharf',
          '2026-10-13',
          '245.00',
          [
            { name: 'Standard Room Night', price: '215.00' },
            { name: 'City Tourist Tax', price: '8.00' },
            { name: 'Buffet Breakfast', price: '22.00' },
          ],
          '40.83',
          'HTL-LON-4421',
          '£'
        ),
        createdAt: '2026-10-13T08:15:00Z',
        convertedAmountEUR: convertToEUR(245.0, 'GBP'),
      },
      {
        id: 'rec-103',
        tripId: 'trip-1',
        merchant: 'Dishoom Shoreditch Restaurant',
        date: '2026-10-14',
        amount: 62.4,
        currency: 'GBP',
        category: 'MEALS',
        taxAmount: 10.4,
        receiptNumber: 'DSH-LON-992',
        notes: 'Working dinner with client engineers',
        imageUrl: createSvgReceipt(
          'Dishoom Shoreditch Restaurant',
          '2026-10-14',
          '62.40',
          [
            { name: 'Biryani Special', price: '28.00' },
            { name: 'House Chai & Starters', price: '18.40' },
            { name: 'Desserts & Water', price: '16.00' },
          ],
          '10.40',
          'DSH-LON-992',
          '£'
        ),
        createdAt: '2026-10-14T20:30:00Z',
        convertedAmountEUR: convertToEUR(62.4, 'GBP'),
      },
    ],
  },
  {
    id: 'trip-2',
    title: 'VivaTech International Innovation Expo',
    destination: 'Paris, France',
    startDate: '2026-10-01',
    endDate: '2026-10-03',
    status: 'SUBMITTED',
    employeeName: 'Alexandre Dumont',
    employeeEmail: 'a.dumont@corporate.com',
    employeeId: 'EMP-4091',
    department: 'Digital Solutions & Consulting',
    projectCode: 'MKT-VIVATECH-26',
    createdAt: '2026-09-28T14:00:00Z',
    submittedAt: '2026-10-04T10:15:00Z',
    receipts: [
      {
        id: 'rec-201',
        tripId: 'trip-2',
        merchant: 'VivaTech Paris Expo Pass',
        date: '2026-10-01',
        amount: 320.0,
        currency: 'EUR',
        category: 'OTHER',
        taxAmount: 53.33,
        receiptNumber: 'VT-2026-PASS',
        notes: '3-day conference attendee badge',
        imageUrl: createSvgReceipt(
          'VivaTech Paris Expo Pass',
          '2026-10-01',
          '320.00',
          [{ name: 'Full Conference Badge', price: '320.00' }],
          '53.33',
          'VT-2026-PASS',
          '€'
        ),
        createdAt: '2026-10-01T08:00:00Z',
        convertedAmountEUR: 320.0,
      },
      {
        id: 'rec-202',
        tripId: 'trip-2',
        merchant: 'Brasserie Port de Versailles',
        date: '2026-10-02',
        amount: 46.5,
        currency: 'EUR',
        category: 'MEALS',
        taxAmount: 7.75,
        receiptNumber: 'BR-PAR-402',
        notes: 'Lunch during partner pitch meetings',
        imageUrl: createSvgReceipt(
          'Brasserie Versailles',
          '2026-10-02',
          '46.50',
          [
            { name: 'Menu Midi Express', price: '32.00' },
            { name: 'Evian 50cl', price: '4.50' },
            { name: 'Double Espresso', price: '10.00' },
          ],
          '7.75',
          'BR-PAR-402',
          '€'
        ),
        createdAt: '2026-10-02T13:10:00Z',
        convertedAmountEUR: 46.5,
      },
    ],
  },
  {
    id: 'trip-3',
    title: 'European Banking Cloud Seminar',
    destination: 'Zurich, Switzerland',
    startDate: '2026-09-18',
    endDate: '2026-09-20',
    status: 'CHANGES_REQUESTED',
    employeeName: 'Alexandre Dumont',
    employeeEmail: 'a.dumont@corporate.com',
    employeeId: 'EMP-4091',
    department: 'Digital Solutions & Consulting',
    projectCode: 'FIN-ZURICH-09',
    createdAt: '2026-09-15T11:00:00Z',
    submittedAt: '2026-09-21T09:00:00Z',
    hrComment:
      'The hotel invoice does not detail the local tourist tax versus room price. Please replace or attach the itemized folio from Hotel Marriott Zurich.',
    hrReviewedAt: '2026-09-22T14:20:00Z',
    hrReviewedBy: 'Sarah Jenkins (HR Operations Lead)',
    receipts: [
      {
        id: 'rec-301',
        tripId: 'trip-3',
        merchant: 'Swiss International Air Lines',
        date: '2026-09-18',
        amount: 285.0,
        currency: 'CHF',
        category: 'TRANSPORT',
        taxAmount: 22.0,
        receiptNumber: 'SWISS-LX-102',
        notes: 'Roundtrip flight ticket CDG - ZRH',
        imageUrl: createSvgReceipt(
          'Swiss Air Lines',
          '2026-09-18',
          '285.00',
          [{ name: 'Flight Economy Classic', price: '285.00' }],
          '22.00',
          'SWISS-LX-102',
          'CHF'
        ),
        createdAt: '2026-09-18T07:45:00Z',
        convertedAmountEUR: convertToEUR(285.0, 'CHF'),
      },
    ],
  },
  {
    id: 'trip-4',
    title: 'Airbus Systems Integration Workshop',
    destination: 'Toulouse, France',
    startDate: '2026-09-02',
    endDate: '2026-09-04',
    status: 'APPROVED',
    employeeName: 'Alexandre Dumont',
    employeeEmail: 'a.dumont@corporate.com',
    employeeId: 'EMP-4091',
    department: 'Digital Solutions & Consulting',
    projectCode: 'AER-TOULOUSE-01',
    createdAt: '2026-08-30T10:00:00Z',
    submittedAt: '2026-09-05T16:00:00Z',
    hrComment: 'Approved. Included in payroll transfer of September 28.',
    hrReviewedAt: '2026-09-06T11:00:00Z',
    hrReviewedBy: 'Sarah Jenkins (HR Operations Lead)',
    receipts: [
      {
        id: 'rec-401',
        tripId: 'trip-4',
        merchant: 'SNCF TGV INOUI Toulouse',
        date: '2026-09-02',
        amount: 142.0,
        currency: 'EUR',
        category: 'TRANSPORT',
        taxAmount: 14.2,
        receiptNumber: 'TGV-TLS-882',
        notes: 'Paris Montparnasse to Toulouse Matabiau',
        imageUrl: createSvgReceipt(
          'SNCF TGV INOUI',
          '2026-09-02',
          '142.00',
          [{ name: 'Billet 1ère Classe', price: '142.00' }],
          '14.20',
          'TGV-TLS-882',
          '€'
        ),
        createdAt: '2026-09-02T06:30:00Z',
        convertedAmountEUR: 142.0,
      },
      {
        id: 'rec-402',
        tripId: 'trip-4',
        merchant: 'Hôtel Pullman Toulouse Centre',
        date: '2026-09-03',
        amount: 175.0,
        currency: 'EUR',
        category: 'LODGING',
        taxAmount: 29.17,
        receiptNumber: 'PUL-TLS-009',
        notes: 'Room night + petit-déjeuner',
        imageUrl: createSvgReceipt(
          'Pullman Toulouse Centre',
          '2026-09-03',
          '175.00',
          [
            { name: 'Chambre Deluxe', price: '155.00' },
            { name: 'Taxe de séjour', price: '2.80' },
            { name: 'Petit Déjeuner', price: '17.20' },
          ],
          '29.17',
          'PUL-TLS-009',
          '€'
        ),
        createdAt: '2026-09-03T08:00:00Z',
        convertedAmountEUR: 175.0,
      },
    ],
  },
];
