'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, LayoutDashboard, BookOpen, Award, Eye, Shield } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

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
    { href: '/', icon: <Eye className="w-5 h-5" />, label: 'Employer View', segment: 'employer' },
  ];

  // Add admin link for admin users
  if (isAdmin) {
    navItems.push({
      href: '/admin',
      icon: <Shield className="w-5 h-5" />,
      label: 'Admin',
      segment: 'admin',
    });
  }

  const isActive = (segment: string) => {
    if (segment === '/') return pathname === '/';
    return pathname.includes(segment);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      transition={{ duration: 0.3 }}
      className={`hidden md:flex fixed left-0 top-16 h-[calc(100vh-64px)] glass border-r flex-col py-8 z-30 ${className}`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 glass p-1.5 rounded-lg hover:bg-muted transition-colors"
        aria-label="Toggle sidebar"
      >
        <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          const active = isActive(item.segment);
          return (
            <Link
              key={item.segment}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group ${
                active
                  ? 'glass-dark text-primary'
                  : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
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
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 gradient-primary rounded-r-lg"
                  transition={{ duration: 0.3 }}
                />
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 rounded-lg glass text-xs whitespace-nowrap hidden group-hover:block">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-auto px-4 py-4 border-t border-border/50 space-y-2 text-xs text-foreground/60"
        >
          <p className="font-semibold text-foreground/80">LearnLedger v1.0</p>
          <p>Enterprise credential management platform</p>
        </motion.div>
      )}
    </motion.aside>
  );
}
