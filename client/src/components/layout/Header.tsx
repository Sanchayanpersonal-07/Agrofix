import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { HeaderProps } from '@/lib/types';
import { PackageIcon, Menu } from 'lucide-react';

const Header = ({ activeView }: HeaderProps) => {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isAdmin = location === '/admin';
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };
  
  const navigateTo = (path: string) => {
    setLocation(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <PackageIcon className="h-8 w-8 text-primary-500" />
            <h1 className="ml-2 text-xl font-semibold text-gray-800 font-medium">AgroFix</h1>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <Link 
              href="/" 
              className={`text-gray-600 hover:text-gray-800 px-1 py-2 font-medium text-sm ${!isAdmin ? 'border-b-2 border-primary-500 text-primary-500' : ''}`}
            >
              Buyer View
            </Link>
            <Link 
              href="/admin" 
              className={`text-gray-600 hover:text-gray-800 px-1 py-2 font-medium text-sm ${isAdmin ? 'border-b-2 border-primary-500 text-primary-500' : ''}`}
            >
              Admin Dashboard
            </Link>
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
            <button
              onClick={() => navigateTo('/')}
              className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md ${
                !isAdmin ? 'text-primary-500 bg-gray-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Buyer View
            </button>
            <button
              onClick={() => navigateTo('/admin')}
              className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md ${
                isAdmin ? 'text-primary-500 bg-gray-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Admin Dashboard
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
