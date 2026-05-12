import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Link, useLocation } from 'wouter';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NavBar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [location] = useLocation();

  useEffect(() => { setMounted(true); }, []);

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/assessments', label: 'Assessments' },
    { href: '/credentials', label: 'Credentials' },
  ];

  if (!mounted) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="hidden sm:inline font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LearnLedger
            </span>
          </Link>

          <div className="hidden md:flex gap-8 items-center">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors duration-200 ${location === href ? 'text-primary' : 'text-foreground/70 hover:text-foreground'}`}
              >
                {label}
              </Link>
            ))}
            <Button variant="outline" size="sm" className="rounded-lg">
              Guest Demo
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-lg" aria-label="Toggle theme">
              {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fadeInDown">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
