import { ServiceItem } from '../types';

export const SAMPLE_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    title: 'Express Display & Screen Replacement',
    description: '100% original display replacement with instant 45-minute turnaround and touch warranty.',
    iconName: 'Smartphone',
    startingPrice: '₹ 1,499',
    turnaroundTime: '45 Mins',
    warranty: '6 Months Screen Warranty'
  },
  {
    id: 'srv-2',
    title: 'Original Battery Replacement',
    description: 'Restore 100% battery capacity with genuine certified battery cells and health calibration.',
    iconName: 'BatteryCharging',
    startingPrice: '₹ 999',
    turnaroundTime: '30 Mins',
    warranty: '6 Months Replacement Guarantee'
  },
  {
    id: 'srv-3',
    title: 'Water Damage & Chip-Level Repair',
    description: 'Ultrasonic board cleaning, short-circuit diagnostic, and motherboard microsoldering.',
    iconName: 'Wrench',
    startingPrice: '₹ 899',
    turnaroundTime: 'Same Day',
    warranty: 'Tested Diagnostics'
  },
  {
    id: 'srv-4',
    title: 'Software Support & Data Transfer',
    description: 'Complete OS flashing, iCloud / Google Account migration, backup & lock recovery.',
    iconName: 'ShieldCheck',
    startingPrice: '₹ 499',
    turnaroundTime: '20 Mins',
    warranty: 'Data Privacy Assured'
  }
];
