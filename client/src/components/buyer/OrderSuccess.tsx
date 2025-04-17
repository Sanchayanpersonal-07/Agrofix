import { Button } from '@/components/ui/button';
import { OrderSuccessProps } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

const OrderSuccess = ({ orderId, onTrackOrder }: OrderSuccessProps) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
      <h3 className="text-xl font-semibold text-green-800 mb-2">Order Placed Successfully!</h3>
      <p className="text-green-700 mb-4">Your order has been received and is being processed.</p>
      <div className="bg-white p-4 rounded-md inline-block">
        <p className="text-gray-600">Your Order ID</p>
        <p className="text-xl font-bold text-gray-800 mt-1">#{orderId}</p>
        <p className="text-sm text-gray-500 mt-1">Please save this ID for tracking your order.</p>
      </div>
      <div className="mt-6">
        <Button 
          onClick={onTrackOrder}
          className="bg-primary-500 hover:bg-primary-600"
        >
          Track This Order
        </Button>
      </div>
    </div>
  );
};

export default OrderSuccess;
