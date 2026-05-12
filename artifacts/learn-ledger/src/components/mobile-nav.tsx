import { Link, useLocation } from 'wouter';
import { BarChart3, FileText, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { href: '/', icon: BarChart3, label: 'Dashboard' },
    { href: '/assessments', icon: FileText, label: 'Assessments' },
    { href: '/credentials', icon: Award, label: 'Credentials' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40 glass border-t">
      <div className="flex justify-around">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-4 px-4 min-h-[60px] transition-colors duration-200 hover:bg-muted/30',
                isActive ? 'text-primary' : 'text-foreground/50 hover:text-foreground/70'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
