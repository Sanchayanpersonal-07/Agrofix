import { Order, OrderItem, OrderStatus, Product } from '@shared/schema';

export interface CartItem extends OrderItem {}

export type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
};

export interface CommonProps {
  className?: string;
}

export interface OrderFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPincode: string;
}

export interface OrderSuccessProps {
  orderId: number;
  onTrackOrder: () => void;
}

export interface TrackOrderProps {
  onOrderTracked: (order: Order) => void;
}

export interface OrderDetailsProps {
  order: Order | null;
}

export interface ProductCardProps {
  product: Product;
  onAddToOrder: (product: Product) => void;
}

export interface ProductGridProps {
  products: Product[];
  onAddToOrder: (product: Product) => void;
  isLoading?: boolean;
}

export interface AdminSidebarProps {
  activeTab: 'orders' | 'inventory';
  onChangeTab: (tab: 'orders' | 'inventory') => void;
}

export interface OrdersManagementProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onUpdateOrderStatus: (order: Order) => void;
  isLoading?: boolean;
}

export interface InventoryManagementProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  isLoading?: boolean;
}

export interface UpdateOrderStatusModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: number, status: OrderStatus) => void;
}

export interface ProductFormModalProps {
  isOpen: boolean;
  product?: Product;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> & { id?: number }) => void;
}

export interface HeaderProps {
  activeView?: 'buyer' | 'admin';
}
