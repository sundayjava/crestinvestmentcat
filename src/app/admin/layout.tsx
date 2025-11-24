'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Bell, 
  LogOut,
  Menu,
  X,
  CreditCard,
  PieChart,
  Wallet,
  CalendarClock
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface BadgeCounts {
  newUsers: number;
  pendingInvestments: number;
  pendingWithdrawals: number;
  pendingAppointments: number;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, badge: null },
  { name: 'Users', href: '/admin/users', icon: Users, badge: null },
  { name: 'Investments', href: '/admin/investments', icon: PieChart, badge: 'pendingInvestments' },
  { name: 'Withdrawals', href: '/admin/withdrawals', icon: Wallet, badge: 'pendingWithdrawals' },
  { name: 'Transactions', href: '/admin/transactions', icon: TrendingUp, badge: null },
  { name: 'Appointments', href: '/admin/appointments', icon: CalendarClock, badge: 'pendingAppointments' },
  { name: 'Assets', href: '/admin/assets', icon: DollarSign, badge: null },
  { name: 'Deposit Methods', href: '/admin/deposit-methods', icon: CreditCard, badge: null },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell, badge: null },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isHydrated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({
    newUsers: 0,
    pendingInvestments: 0,
    pendingWithdrawals: 0,
    pendingAppointments: 0,
  });

  useEffect(() => {
    if (!isHydrated) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchBadgeCounts();
    const interval = setInterval(fetchBadgeCounts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [user, isHydrated]);

  const fetchBadgeCounts = async () => {
    try {
      const response = await fetch('/api/admin/badge-counts');
      if (response.ok) {
        const data = await response.json();
        console.log('Badge counts received:', data);
        setBadgeCounts(data);
      }
    } catch (error) {
      console.error('Error fetching badge counts:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isHydrated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bea425]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-black transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-[#bea425] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">I</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CrestCat</h1>
                <p className="text-xs text-[#bea425]">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const badgeCount = item.badge ? badgeCounts[item.badge as keyof BadgeCounts] : 0;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#bea425] text-white'
                      : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {badgeCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-800 p-4">
            <div className="mb-3 px-4">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-900"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-black"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-[#bea425] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">I</span>
              </div>
              <span className="font-bold text-black">CrestCat Admin</span>
            </div>
            <div className="w-6" />
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
