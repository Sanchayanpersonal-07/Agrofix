import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { HeaderProps } from '@/lib/types';
import { PackageIcon, Menu, LogOut, LogIn, UserCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = ({ activeView }: HeaderProps) => {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  
  const isAdmin = location === '/admin';
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };
  
  const navigateTo = (path: string) => {
    setLocation(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation('/auth');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <PackageIcon className="h-8 w-8 text-primary-500" />
            <h1 className="ml-2 text-xl font-semibold text-gray-800 font-medium">AgroFix</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <Link 
                  href="/" 
                  className={`text-gray-600 hover:text-gray-800 px-1 py-2 font-medium text-sm ${!isAdmin ? 'border-b-2 border-primary-500 text-primary-500' : ''}`}
                >
                  Buyer View
                </Link>
                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className={`text-gray-600 hover:text-gray-800 px-1 py-2 font-medium text-sm ${isAdmin ? 'border-b-2 border-primary-500 text-primary-500' : ''}`}
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            )}
            
            <div className="ml-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <UserCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">{user.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigateTo('/auth')}
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-3 space-y-1">
            {user && (
              <>
                <button
                  onClick={() => navigateTo('/')}
                  className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md ${
                    !isAdmin ? 'text-primary-500 bg-gray-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  Buyer View
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => navigateTo('/admin')}
                    className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md ${
                      isAdmin ? 'text-primary-500 bg-gray-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    Admin Dashboard
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout ({user.username})</span>
                </button>
              </>
            )}
            
            {!user && (
              <button
                onClick={() => navigateTo('/auth')}
                className="flex items-center w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
              >
                <LogIn className="mr-2 h-4 w-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
