'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/I18nProvider';

export function AdminNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const links = [
    { href: '/', label: t('dashboard') },
    { href: '/products', label: t('products') },
    { href: '/tables', label: t('tables') },
    { href: '/shifts', label: t('shifts') },
    { href: '/orders', label: t('orders') },
    { href: '/reports', label: t('reports') },
    { href: '/kitchen', label: t('kitchen') },
    { href: '/settings/outlets', label: t('outlets') },
  ];
  return (
    <nav className="sidebar-nav">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link key={link.href} href={link.href} className={active ? 'nav-link active' : 'nav-link'}>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
