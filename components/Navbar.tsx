'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getUserSubscriptionPlan } from '@/lib/subscription';
import { storage } from '@/lib/storage';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('Free');
  const [mounted, setMounted] = useState(false);

  // Load user session and subscription
  const loadUserData = async () => {
    if (typeof window === 'undefined') return;

    try {
      const session = localStorage.getItem('dreamify_session');
      console.log('Navbar: Raw session from localStorage:', session);
      if (session) {
        const userData = JSON.parse(session);
        console.log('Navbar: Parsed userData:', userData);
        console.log('Navbar: userData.role:', userData.role);
        console.log('Navbar: Is admin?', userData.role?.toLowerCase() === 'admin');

        // Set user immediately from localStorage (includes role)
        setUser(userData);

        // Get subscription tier
        const subscription = storage.getUserSubscription(userData.id);
        if (subscription) {
          if (subscription.tier === 'pro') {
            if (subscription.promoCode) {
              setSubscriptionTier('Education');
            } else {
              setSubscriptionTier('Pro');
            }
          } else if (subscription.tier === 'pro-plus') {
            setSubscriptionTier('Pro+');
          } else {
            setSubscriptionTier('Free');
          }
        } else {
          setSubscriptionTier('Free');
        }

        // Only fetch role from API for non-admin users (admin uses different auth)
        if (userData.role?.toLowerCase() !== 'admin') {
          try {
            const roleResponse = await fetch('/api/user/role');
            if (roleResponse.ok) {
              const roleData = await roleResponse.json();
              // Update user with role from database
              setUser((prev: any) => prev ? { ...prev, role: roleData.role } : null);
            } else if (roleResponse.status === 401) {
              // User not authenticated - clear stale session
              localStorage.removeItem('dreamify_session');
              setUser(null);
              setSubscriptionTier('Free');
            }
          } catch (roleError) {
            console.error('Error fetching user role:', roleError);
          }
        }
      } else {
        setUser(null);
        setSubscriptionTier('Free');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
      setSubscriptionTier('Free');
    }
  };

  useEffect(() => {
    setMounted(true);
    loadUserData();

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dreamify_session') {
        loadUserData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom login/logout events (same-tab updates)
    const handleAuthChange = () => {
      loadUserData();
    };
    window.addEventListener('gostarthub:auth-change', handleAuthChange);

    // Also check periodically in case of same-tab updates (less frequent)
    const interval = setInterval(() => {
      loadUserData();
    }, 2000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('gostarthub:auth-change', handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dreamify_session');
      setUser(null);
      setSubscriptionTier('Free');
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('gostarthub:auth-change'));
      window.location.href = '/';
    }
  };

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full border-b bg-gradient-to-r from-cyan-50/90 via-blue-50/90 to-purple-50/90 backdrop-blur-xl supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-cyan-50/70 supports-[backdrop-filter]:via-blue-50/70 supports-[backdrop-filter]:to-purple-50/70 transition-all border-cyan-400/30",
      scrolled && "shadow-lg shadow-cyan-500/20 glow-blue"
    )}>
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center group">
          <img
            src="/images/gostarthublogo.png"
            alt="Go Start Hub Logo"
            className="h-12 w-auto group-hover:opacity-80 transition-opacity flex-shrink-0"
            onError={(e) => {
              // Fallback to icon if image fails
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="relative"><svg class="h-6 w-6 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg></div>';
              }
            }}
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/startups" className="text-sm font-medium text-muted-foreground hover:text-cyan-500 transition-colors duration-300 hover:scale-105">
            Startups
          </Link>

          <Link href="/mentors" className="text-sm font-medium text-muted-foreground hover:text-cyan-500 transition-colors duration-300 hover:scale-105">
            Mentors
          </Link>
          <Link href="/funding" className="text-sm font-medium text-muted-foreground hover:text-cyan-500 transition-colors duration-300 hover:scale-105">
            Funding
          </Link>

          {/* Dynamic Mentor Portal link - only show for MENTOR role */}
          {mounted && user && user.role === 'MENTOR' && (
            <Link href="/mentor/dashboard" className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors duration-300 hover:scale-105">
              Mentor Portal
            </Link>
          )}

          {mounted && user ? (
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-border/50">
              {/* Hide subscription tier for admin users */}
              {user.role?.toLowerCase() !== 'admin' && (
                <Link href="/subscription" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  <Crown className="h-4 w-4" />
                  <span>{subscriptionTier}</span>
                </Link>
              )}
              {/* Admin users go to /admin, regular users go to /dashboard */}
              <Link href={user.role?.toLowerCase() === 'admin' ? "/admin" : "/dashboard"} className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors">
                <User className="h-4 w-4" />
                <span>{user.role?.toLowerCase() === 'admin' ? 'Admin' : user.name}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="btn btn-ghost">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : mounted ? (
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-border/50">
              <Link href="/login" className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                Login
              </Link>
              <Link href="/register" className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white shadow-lg border-0 transition-colors">
                Join Now
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-border/50">
              <div className="h-9 w-16 bg-muted animate-pulse rounded"></div>
              <div className="h-9 w-24 bg-muted animate-pulse rounded"></div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container px-4 py-4 space-y-3">
            <Link href="/startups" className="block text-sm font-medium hover:text-primary transition-colors">
              Startups
            </Link>

            <Link href="/mentors" className="block text-sm font-medium hover:text-primary transition-colors">
              Mentors
            </Link>
            <Link href="/funding" className="block text-sm font-medium hover:text-primary transition-colors">
              Funding
            </Link>

            {/* Dynamic Mentor Portal link - only show for MENTOR role */}
            {mounted && user && user.role === 'MENTOR' && (
              <Link href="/dashboard/mentor" className="block text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors">
                Mentor Portal
              </Link>
            )}

            {mounted && user ? (
              <>
                {/* Hide subscription tier for admin users */}
                {user.role?.toLowerCase() !== 'admin' && (
                  <Link href="/subscription" className="flex items-center gap-1.5 block text-sm font-medium hover:text-primary transition-colors">
                    <Crown className="h-4 w-4" />
                    <span>{subscriptionTier}</span>
                  </Link>
                )}
                {/* Admin users go to /admin, regular users go to /dashboard */}
                <Link href={user.role?.toLowerCase() === 'admin' ? "/admin" : "/dashboard"} className="block text-sm font-medium hover:text-primary transition-colors">
                  {user.role?.toLowerCase() === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : mounted ? (
              <>
                <Link href="/login" className="block w-full text-left py-2 px-3 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                  Login
                </Link>
                <Link href="/register" className="block w-full text-center py-2 px-3 rounded-md text-sm font-medium bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white shadow-lg border-0 transition-colors">
                  Join Now
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}

