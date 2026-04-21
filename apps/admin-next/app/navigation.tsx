// Lightweight admin navigation config
import React from 'react';

export type NavItem = {
  label: string;
  href: string;
  icon?: string;
};

// This is a minimal integration point. If the real admin layout imports a different path,
// adjust accordingly. The goal is to expose a loyal navigation item for the Admin UI.
export const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: 'dashboard' },
  { label: 'Orders', href: '/orders', icon: 'list' },
  { label: 'KDS', href: '/ops/kds', icon: 'kitchen' },
  { label: 'Reports', href: '/reports', icon: 'chart' },
  { label: 'HQ Insights', href: '/hq', icon: 'business' },
  { label: 'Suppliers', href: '/procurement/suppliers', icon: 'local_shipping' },
  { label: 'PO & Stock In', href: '/procurement/purchase-orders', icon: 'inventory_2' },
  { label: 'Tables', href: '/tables', icon: 'table' },
  { label: 'Audit Logs', href: '/audit-logs', icon: 'shield' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
];

// Simple hook-like helper for components that import this module
export function useAdminNav(): NavItem[] {
  // In a real app this could pull from global store or config
  return adminNav;
}

export default adminNav;
