import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tab } from '@headlessui/react';
import { Product, Order } from '@shared/schema';
import { useCart } from '@/store/CartContext';
import { useToast } from '@/hooks/use-toast';

import ProductGrid from '@/components/buyer/ProductGrid';
import OrderForm from '@/components/buyer/OrderForm';
import TrackOrder from '@/components/buyer/TrackOrder';
import OrderSuccess from '@/components/buyer/OrderSuccess';
import OrderDetails from '@/components/buyer/OrderDetails';

const Home = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const { addItem } = useCart();
  const { toast } = useToast();
  
  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Handlers
  const handleAddToOrder = (product: Product) => {
    addItem(product, 1);
    
    toast({
      title: 'Added to order',
      description: `${product.name} added to your order`,
      duration: 3000,
    });
    
    // Switch to the order tab
    setSelectedTab(1);
  };
  
  const handleOrderSuccess = (newOrderId: number) => {
    setOrderId(newOrderId);
  };
  
  const handleTrackOrder = () => {
    setSelectedTab(2);
  };
  
  const handleOrderTracked = (order: Order) => {
    setTrackedOrder(order);
  };
  
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="border-b border-gray-200 mb-6">
          <div className="-mb-px flex space-x-8">
            {['Product Catalog', 'Place Order', 'Track Order'].map((tabName, index) => (
              <Tab
                key={index}
                className={({ selected }) => `
                  whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm outline-none
                  ${selected
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tabName}
              </Tab>
            ))}
          </div>
        </Tab.List>
        
        <Tab.Panels>
          {/* Catalog View */}
          <Tab.Panel>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Fresh Produce Catalog</h2>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <ProductGrid 
                products={products}
                onAddToOrder={handleAddToOrder}
                isLoading={isLoading}
              />
            </div>
          </Tab.Panel>
          
          {/* Order Form View */}
          <Tab.Panel>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Place Bulk Order</h2>
              
              {orderId ? (
                <OrderSuccess 
                  orderId={orderId} 
                  onTrackOrder={handleTrackOrder} 
                />
              ) : (
                <OrderForm onOrderSuccess={handleOrderSuccess} />
              )}
            </div>
          </Tab.Panel>
          
          {/* Order Tracking View */}
          <Tab.Panel>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Track Your Order</h2>
              
              <TrackOrder onOrderTracked={handleOrderTracked} />
              
              {trackedOrder && (
                <OrderDetails order={trackedOrder} />
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </main>
  );
};

export default Home;
