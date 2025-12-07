import { BookOpen, Search, LogOut, BookMarked, LayoutDashboard, Library } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { User, Page } from '../App';

type NavbarProps = {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
};

export function Navbar({ user, onLogout, onNavigate, searchQuery = '', onSearchChange, showSearch = false }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate(user.role === 'admin' ? 'admin-dashboard' : 'home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-br from-teal-600 to-cyan-500 p-2 rounded-lg">
              <BookOpen className="size-6 text-white" />
            </div>
            <span className="text-xl">YallaLibrary</span>
          </button>

          {/* Search Bar (if enabled) */}
          {showSearch && (
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* User Actions */}
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.username}!</span>

            {user.role === 'admin' ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('admin-dashboard')}
                  className="gap-2"
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('manage-books')}
                  className="gap-2"
                >
                  <Library className="size-4" />
                  Manage Books
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('my-borrows')}
                className="gap-2"
              >
                <BookMarked className="size-4" />
                My Borrows
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="gap-2"
            >
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}