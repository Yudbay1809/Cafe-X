// Lightweight admin navigation config - Sultan Expansion
import React from 'react';

export type NavItem = {
  label: string;
  href: string;
  icon?: string;
};

// Sultanized Navigation labels for the Enterprise HQ
export const adminNav: NavItem[] = [
  { label: 'Executive Dashboard', href: '/', icon: 'dashboard' },
  { label: 'Revenue Analytics', href: '/analytics', icon: 'payments' },
  { label: 'Inventory & AI Forecast', href: '/inventory', icon: 'auto_awesome' },
  { label: 'Staff & Payroll HQ', href: '/staff', icon: 'groups' },
  { label: 'CRM & Gamification', href: '/crm', icon: 'emoji_events' },
  { label: 'Multi-Brand HQ', href: '/brands', icon: 'business' },
  { label: 'Supply Chain & PO', href: '/procurement/suppliers', icon: 'local_shipping' },
  { label: 'Audit & Security', href: '/audit', icon: 'security' },
  { label: 'System Settings', href: '/settings', icon: 'settings' },
];

export function useAdminNav(): NavItem[] {
  return adminNav;
}

export default adminNav;
