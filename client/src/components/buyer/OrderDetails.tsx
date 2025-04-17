import { OrderDetailsProps } from '@/lib/types';
import { formatCurrency, formatDate, statusColors, statusNames } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { OrderItem } from '@shared/schema';

const OrderProgress = ({ status }: { status: string }) => {
  const steps = ['pending', 'in_progress', 'delivered'];
  const currentStepIndex = steps.indexOf(status);
  
  return (
    <div className="pt-6">
      <h4 className="text-sm font-medium text-gray-500 mb-4">Order Progress</h4>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="h-0.5 w-full bg-gray-200"></div>
        </div>
        <ol className="relative flex justify-between">
          <li className="flex items-center">
            <span className={`h-5 w-5 rounded-full ${currentStepIndex >= 0 ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center`}>
              {currentStepIndex >= 0 ? (
                <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="h-2 w-2 rounded-full bg-gray-600"></span>
              )}
            </span>
            <div className="ml-2 text-center">
              <div className={`text-xs font-medium ${currentStepIndex >= 0 ? 'text-gray-900' : 'text-gray-400'}`}>Order Received</div>
              <div className="text-xs text-gray-500">{currentStepIndex >= 0 ? formatDate(new Date()) : 'Pending'}</div>
            </div>
          </li>
          
          <li className="flex items-center">
            <span className={`h-5 w-5 rounded-full ${currentStepIndex >= 1 ? 'bg-blue-500' : 'bg-gray-300'} flex items-center justify-center`}>
              {currentStepIndex >= 1 ? (
                <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="h-2 w-2 rounded-full bg-gray-600"></span>
              )}
            </span>
            <div className="ml-2 text-center">
              <div className={`text-xs font-medium ${currentStepIndex >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Processing</div>
              <div className="text-xs text-gray-500">{currentStepIndex >= 1 ? formatDate(new Date()) : 'Pending'}</div>
            </div>
          </li>
          
          <li className="flex items-center">
            <span className={`h-5 w-5 rounded-full ${currentStepIndex >= 2 ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center`}>
              {currentStepIndex >= 2 ? (
                <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="h-2 w-2 rounded-full bg-gray-600"></span>
              )}
            </span>
            <div className="ml-2 text-center">
              <div className={`text-xs font-medium ${currentStepIndex >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Delivered</div>
              <div className="text-xs text-gray-500">{currentStepIndex >= 2 ? formatDate(new Date()) : 'Pending'}</div>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
};

const OrderDetails = ({ order }: OrderDetailsProps) => {
  if (!order) return null;
  
  const items = order.items as OrderItem[];
  const statusColor = statusColors[order.status as keyof typeof statusColors] || 'bg-gray-500';
  const statusName = statusNames[order.status as keyof typeof statusNames] || 'Unknown';
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Order #{order.id}</h3>
        <div className={`${statusColor} text-white text-sm py-1 px-3 rounded-full font-medium`}>
          {statusName}
        </div>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h4>
          <p className="text-sm text-gray-800">{order.customerName}</p>
          <p className="text-sm text-gray-800">{order.customerEmail}</p>
          <p className="text-sm text-gray-800">{order.customerPhone}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Delivery Address</h4>
          <p className="text-sm text-gray-800">{order.deliveryAddress}</p>
          <p className="text-sm text-gray-800">{order.deliveryCity}, {order.deliveryPincode}</p>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-3">Order Items</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Unit</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.imageUrl && (
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={item.imageUrl} 
                            alt={item.productName} 
                          />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(item.price)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.quantity} kg</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <Separator />
      
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Order Placed</h4>
          <p className="text-sm text-gray-800">{formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Total Amount</h4>
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(Number(order.totalAmount))}</p>
        </div>
      </div>
      
      <OrderProgress status={order.status} />
    </div>
  );
};

export default OrderDetails;
