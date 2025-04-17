import { ProductCardProps } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

const ProductCard = ({ product, onAddToOrder }: ProductCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 bg-gray-200 relative">
        {product.imageUrl && (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-0 left-0 bg-primary-500 text-white px-2 py-1 text-sm font-medium">
          {formatCurrency(Number(product.price))}/kg
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
        <Button 
          onClick={() => onAddToOrder(product)}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white"
          size="sm"
        >
          Add to Order
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
