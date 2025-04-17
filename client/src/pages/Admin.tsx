import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Order, Product, OrderStatus } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import AdminSidebar from '@/components/admin/AdminSidebar';
import OrdersManagement from '@/components/admin/OrdersManagement';
import InventoryManagement from '@/components/admin/InventoryManagement';
import UpdateOrderStatusModal from '@/components/admin/UpdateOrderStatusModal';
import ProductFormModal from '@/components/admin/ProductFormModal';
import OrderDetails from '@/components/buyer/OrderDetails';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  
  // Modal states
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { toast } = useToast();
  
  // Fetch data
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });
  
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Handlers for order operations
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };
  
  const handleUpdateOrderStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };
  
  const submitOrderStatusUpdate = async (orderId: number, status: OrderStatus) => {
    try {
      await apiRequest('PUT', `/api/orders/${orderId}/status`, { status });
      
      // Refetch orders and close modal
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      toast({
        title: 'Status updated',
        description: `Order #${orderId} status updated to ${status}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error updating status',
        description: error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive',
      });
    }
  };
  
  // Handlers for product operations
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };
  
  const handleDeleteProduct = (productId: number) => {
    // This is handled in the InventoryManagement component
  };
  
  const saveProduct = async (product: Omit<Product, 'id'> & { id?: number }) => {
    try {
      if (product.id) {
        // Update existing product
        await apiRequest('PUT', `/api/products/${product.id}`, product);
        toast({
          title: 'Product updated',
          description: `${product.name} has been updated successfully.`,
          duration: 3000,
        });
      } else {
        // Create new product
        await apiRequest('POST', '/api/products', product);
        toast({
          title: 'Product added',
          description: `${product.name} has been added to the catalog.`,
          duration: 3000,
        });
      }
      
      // Refetch products
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error saving product',
        description: error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row">
        <AdminSidebar activeTab={activeTab} onChangeTab={setActiveTab} />
        
        <div className="flex-1">
          {/* Orders Management */}
          {activeTab === 'orders' && (
            <OrdersManagement 
              orders={orders}
              onViewOrder={handleViewOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              isLoading={ordersLoading}
            />
          )}
          
          {/* Inventory Management */}
          {activeTab === 'inventory' && (
            <InventoryManagement 
              products={products}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              isLoading={productsLoading}
            />
          )}
        </div>
      </div>
      
      {/* Order Details Modal */}
      {isOrderDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Order Details</h3>
                <button 
                  onClick={() => setIsOrderDetailsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <OrderDetails order={selectedOrder} />
            </div>
          </div>
        </div>
      )}
      
      {/* Update Order Status Modal */}
      <UpdateOrderStatusModal 
        isOpen={isStatusModalOpen}
        order={selectedOrder}
        onClose={() => setIsStatusModalOpen(false)}
        onUpdateStatus={submitOrderStatusUpdate}
      />
      
      {/* Product Form Modal */}
      <ProductFormModal 
        isOpen={isProductModalOpen}
        product={selectedProduct || undefined}
        onClose={() => setIsProductModalOpen(false)}
        onSave={saveProduct}
      />
    </main>
  );
};

export default Admin;
