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
  { label: 'Reports', href: '/reports', icon: 'chart' },
  { label: 'Tables', href: '/tables', icon: 'table' },
  // New: Customer Loyalty management
  { label: 'Customer Loyalty', href: '/loyalty', icon: 'gift' },
  { label: 'QR Code', href: '/qr', icon: 'qr' },
];

// Simple hook-like helper for components that import this module
export function useAdminNav(): NavItem[] {
  // In a real app this could pull from global store or config
  return adminNav;
}

export default adminNav;
