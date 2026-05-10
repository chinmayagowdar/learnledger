'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, LayoutDashboard, BookOpen, Award, Eye, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const navItems = [
    { href: '/', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', segment: '/' },
    { href: '/assessments', icon: <BookOpen className="w-5 h-5" />, label: 'Assessments', segment: 'assessments' },
    { href: '/credentials', icon: <Award className="w-5 h-5" />, label: 'Credentials', segment: 'credentials' },
    { href: '/verify', icon: <Eye className="w-5 h-5" />, label: 'Verify', segment: 'verify' },
    ...(isAdmin ? [{ href: '/admin', icon: <Shield className="w-5 h-5" />, label: 'Admin', segment: 'admin' }] : []),
  ];

  const isActive = (segment: string) => {
    if (segment === '/') return pathname === '/';
    return pathname.includes(segment);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '72px' : '240px' }}
      transition={{ duration: 0.2 }}
      className={`hidden md:flex fixed left-0 top-16 h-[calc(100vh-64px)] glass border-r flex-col py-6 z-30 ${className}`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 glass p-1 rounded-md hover:bg-muted transition-colors"
        aria-label="Toggle sidebar"
      >
        <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active = isActive(item.segment);
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-150 relative group ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/60 hover:text-foreground hover:bg-muted/50'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-md"
                  transition={{ duration: 0.2 }}
                />
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 rounded-md glass text-xs whitespace-nowrap hidden group-hover:block z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-auto px-3 py-3 border-t border-border/50 space-y-1 text-xs text-foreground/50"
        >
          <p className="font-medium text-foreground/70">LearnLedger v2.0</p>
          <p>Credential verification platform</p>
        </motion.div>
      )}
    </motion.aside>
  );
}
