'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, FileText, Award, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export default function MobileNav() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const navItems = [
    { href: '/', icon: BarChart3, label: 'Dashboard' },
    { href: '/assessments', icon: FileText, label: 'Assessments' },
    { href: '/credentials', icon: Award, label: 'Credentials' },
    ...(isAdmin ? [{ href: '/admin', icon: Shield, label: 'Admin' }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40 glass border-t border-b-0">
      <div className="flex justify-around">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-3 px-3 min-h-[56px] transition-colors duration-150',
                isActive
                  ? 'text-primary'
                  : 'text-foreground/40 hover:text-foreground/60'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
