'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Moon, Sun, Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

export default function NavBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isAuthenticated, isGuest, signOut, enterGuestMode } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    router.push('/');
  };

  const handleGuestMode = () => {
    enterGuestMode();
    toast.success('Entered guest mode');
  };

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/assessments', label: 'Assessments' },
    { href: '/credentials', label: 'Credentials' },
  ];

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!mounted) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="hidden sm:inline font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LearnLedger
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8 items-center">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-foreground/70 hover:text-foreground transition-colors duration-200 font-medium"
              >
                {label}
              </Link>
            ))}

            {/* Auth buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback className="gradient-primary text-white text-sm">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback className="gradient-primary text-white text-xs">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {isGuest ? 'Guest Mode' : user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {isGuest ? (
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" className="gradient-primary text-white" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleGuestMode}>
                  Guest Demo
                </Button>
              </div>
            )}
          </div>

          {/* Theme Toggle & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-lg"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
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
            <div className="pt-2 border-t border-border space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    {isGuest ? 'Guest Mode' : user.email}
                  </div>
                  {isGuest ? (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      Sign In
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors text-destructive"
                    >
                      Sign Out
                    </button>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 rounded-lg gradient-primary text-white text-center"
                  >
                    Sign Up
                  </Link>
                  <button
                    onClick={() => {
                      handleGuestMode();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    Guest Demo
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
