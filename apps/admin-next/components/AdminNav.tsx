'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminNav() {
  const pathname = usePathname();
  
  const links = [
    { href: '/', label: 'Executive Dashboard', icon: '📊' },
    { href: '/inventory', label: 'AI Inventory Forecast', icon: '🪄' },
    { href: '/staff', label: 'Staff & Payroll HQ', icon: '👥' },
    { href: '/crm', label: 'CRM & Gamification', icon: '✨' },
    { href: '/brands', label: 'Multi-Brand HQ', icon: '🏢' },
    { href: '/orders', label: 'Global Sales Feed', icon: '💰' },
    { href: '/audit', label: 'Security Audit Ledger', icon: '🛡️' },
    { href: '/settings/outlets', label: 'Outlet Devices', icon: '🏪' },
  ];

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm tracking-tight ${
              active 
                ? 'bg-[#FBBF2420] text-sultan-cta border border-[#FBBF2430]' 
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-lg opacity-80">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
