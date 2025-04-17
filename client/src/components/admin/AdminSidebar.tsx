import { AdminSidebarProps } from '@/lib/types';
import { PackageIcon, TableIcon } from 'lucide-react';

const AdminSidebar = ({ activeTab, onChangeTab }: AdminSidebarProps) => {
  return (
    <div className="w-full md:w-64 bg-white rounded-lg shadow-sm p-6 md:mr-6 mb-6 md:mb-0">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Admin Panel</h2>
      <nav className="space-y-1">
        <button
          onClick={() => onChangeTab('orders')}
          className={`flex w-full items-center px-2 py-2 text-sm font-medium rounded-md ${
            activeTab === 'orders'
              ? 'bg-primary-50 text-primary-500'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <PackageIcon className="h-5 w-5 mr-2" />
          Orders Management
        </button>
        <button
          onClick={() => onChangeTab('inventory')}
          className={`flex w-full items-center px-2 py-2 text-sm font-medium rounded-md ${
            activeTab === 'inventory'
              ? 'bg-primary-50 text-primary-500'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <TableIcon className="h-5 w-5 mr-2" />
          Inventory Management
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebar;
