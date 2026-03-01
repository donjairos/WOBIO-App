import { VehicleType } from './types';

export const APP_NAME = "WOBIO";
export const PRIMARY_COLOR = "#1877F2";

export const VEHICLES = [
  {
    id: VehicleType.STANDARD,
    name: 'Standard',
    eta: '3-4 min',
    priceMultiplier: 1.0,
    desc: 'Affordable, everyday rides'
  },
  {
    id: VehicleType.SIX_SEATER,
    name: '6-Seater',
    eta: '6-9 min',
    priceMultiplier: 1.6,
    desc: 'Great for groups & luggage'
  },
  {
    id: VehicleType.EXECUTIVE,
    name: 'Executive',
    eta: '5-8 min',
    priceMultiplier: 2.3,
    desc: 'Premium cars for business'
  }
];

export const MOCK_HISTORY = [
  { id: '1', date: 'Oct 24, 10:30 AM', dest: 'Central Mall', price: 12.50, status: 'Completed' },
  { id: '2', date: 'Oct 23, 08:15 AM', dest: 'Tech Park', price: 8.20, status: 'Completed' },
  { id: '3', date: 'Oct 21, 06:45 PM', dest: 'Airport Terminal 3', price: 45.00, status: 'Completed' },
];

export const MOCK_CHART_DATA = [
  { name: 'Mon', trips: 40, amt: 2400 },
  { name: 'Tue', trips: 30, amt: 1398 },
  { name: 'Wed', trips: 20, amt: 9800 },
  { name: 'Thu', trips: 27, amt: 3908 },
  { name: 'Fri', trips: 18, amt: 4800 },
  { name: 'Sat', trips: 23, amt: 3800 },
  { name: 'Sun', trips: 34, amt: 4300 },
];