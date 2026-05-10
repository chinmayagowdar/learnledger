'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Moon, Sun, Menu, X, LogIn, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export default function NavBar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, signOut, isAdmin, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

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
            <div className="w-8 h-8 rounded-md gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="hidden sm:inline font-bold text-lg text-foreground">
              LearnLedger
            </span>
          </Link>

          <div className="hidden md:flex gap-8 items-center">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-foreground/60 hover:text-foreground transition-colors duration-200 font-medium text-sm"
              >
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-foreground/60 hover:text-foreground transition-colors duration-200 font-medium text-sm flex items-center gap-1"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-md"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            )}

            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-foreground/70">{profile?.full_name || user.email}</span>
                <Button variant="outline" size="sm" onClick={signOut} className="rounded-md">
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button variant="outline" size="sm" className="rounded-md">
                  <LogIn className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              </Link>
            )}

            <button
              className="md:hidden p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fadeIn">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 rounded-md hover:bg-muted transition-colors text-sm"
              >
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 rounded-md hover:bg-muted transition-colors text-sm"
              >
                Admin Dashboard
              </Link>
            )}
            {user ? (
              <button
                onClick={() => { signOut(); setIsOpen(false); }}
                className="block w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors text-sm"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 rounded-md hover:bg-muted transition-colors text-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
