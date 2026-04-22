'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/I18nProvider';

export function AdminNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  
  // Sultanized Navigation Items
  const links = [
    { href: '/', label: 'Executive Dashboard', icon: '📊' },
    { href: '/inventory', label: 'AI Inventory Forecast', icon: '🪄' },
    { href: '/staff', label: 'Staff & Payroll HQ', icon: '👥' },
    { href: '/crm', label: 'CRM & Gamification', icon: '✨' },
    { href: '/brands', label: 'Multi-Brand HQ', icon: '🏢' },
    { href: '/orders', label: 'Global Sales Feed', icon: '💰' },
    { href: '/procurement/suppliers', label: 'Supply Chain', icon: '🚚' },
    { href: '/audit', label: 'Security Audit Ledger', icon: '🛡️' },
    { href: '/settings/outlets', label: 'Outlet Devices', icon: '🏪' },
  ];

  return (
    <nav className="flex flex-col gap-2">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all group ${
              active 
                ? 'bg-[#78350F] text-[#FBBF24] shadow-lg shadow-[#78350F]/20 translate-x-2' 
                : 'text-[#92400E] hover:bg-[#FEF3C7] hover:text-[#78350F]'
            }`}
          >
            <span className="text-xl group-hover:scale-125 transition-transform">{link.icon}</span>
            <span className="text-sm tracking-tight">{link.label}</span>
            {active && <div className="ml-auto w-1.5 h-6 bg-[#FBBF24] rounded-full"></div>}
          </Link>
        );
      })}
    </nav>
  );
}
