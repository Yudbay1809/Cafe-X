'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminNav() {
  const pathname = usePathname();
  
  const groups = [
    {
      title: 'General',
      links: [
        { href: '/', label: 'Dashboard', icon: '📊' },
        { href: '/analytics', label: 'Analytics', icon: '📈' },
      ]
    },
    {
      title: 'Operations',
      links: [
        { href: '/orders', label: 'Orders', icon: '🧾' },
        { href: '/products', label: 'Products', icon: '☕' },
        { href: '/inventory', label: 'Inventory', icon: '📦' },
      ]
    },
    {
      title: 'Enterprise',
      links: [
        { href: '/staff', label: 'Staff & HR', icon: '👥' },
        { href: '/crm', label: 'CRM & Loyalty', icon: '✨' },
        { href: '/brands', label: 'Multi-Brand', icon: '🏢' },
      ]
    },
    {
      title: 'System',
      links: [
        { href: '/reports', label: 'X-Reports', icon: '📋' },
        { href: '/audit', label: 'Audit Logs', icon: '🛡️' },
        { href: '/settings', label: 'Settings', icon: '⚙️' },
      ]
    }
  ];

  return (
    <nav className="flex flex-col gap-8 mt-10">
      {groups.map((group) => (
        <div key={group.title} className="space-y-3">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] px-4">
            {group.title}
          </p>
          <div className="flex flex-col gap-1">
            {group.links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={active ? 'sultan-nav-item-active' : 'sultan-nav-item'}
                >
                  <span className="text-xl opacity-80">{link.icon}</span>
                  <span className="uppercase tracking-[0.1em] text-[11px] font-black">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
