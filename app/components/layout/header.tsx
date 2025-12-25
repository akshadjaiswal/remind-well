'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, BellRing, LayoutDashboard, Bell, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MobileNav } from './mobile-nav';
import { useUser } from '@/hooks/use-user';
import { useUserStore } from '@/lib/stores/user-store';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useUser();
  const { clearUser } = useUserStore();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearUser();
    router.push('/');
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const navLinks = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/dashboard/reminders/new',
      label: 'New Reminder',
      icon: Bell,
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: SettingsIcon,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-sticky bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <BellRing className="h-6 w-6 text-primary-500 group-hover:text-primary-600 transition-colors" />
                <span className="text-xl font-bold text-gray-900 hidden sm:inline">RemindWell</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Menu Button */}
              <button
                type="button"
                className="lg:hidden relative z-50 p-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Mobile nav button clicked, current state:', mobileNavOpen);
                  setMobileNavOpen(true);
                }}
                aria-label="Open navigation menu"
                aria-expanded={mobileNavOpen}
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* User Dropdown (Desktop) */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="hidden lg:flex relative h-10 w-10 rounded-full p-0"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary-100 text-primary-700 font-medium text-sm">
                          {getInitials(user.email)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary-100 text-primary-700 font-medium">
                          {getInitials(user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          Free Plan
                        </p>
                      </div>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Settings Link */}
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/settings"
                        className="cursor-pointer flex items-center"
                      >
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Sign Out */}
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer text-error-600 focus:text-error-700 focus:bg-error-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
