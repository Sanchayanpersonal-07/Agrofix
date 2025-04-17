import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { TrackOrderProps } from '@/lib/types';
import { Order } from '@shared/schema';

const trackingSchema = z.object({
  orderId: z.string()
    .min(1, 'Order ID is required')
    .refine((val) => !isNaN(Number(val)), {
      message: 'Please enter a valid order ID',
    }),
});

const TrackOrder = ({ onOrderTracked }: TrackOrderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof trackingSchema>>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      orderId: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof trackingSchema>) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('GET', `/api/orders/${data.orderId}`, undefined);
      const order: Order = await response.json();
      onOrderTracked(order);
    } catch (error) {
      console.error('Error tracking order:', error);
      toast({
        title: 'Order not found',
        description: 'Please check the order ID and try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="orderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter your Order ID</FormLabel>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <FormControl>
                    <Input
                      className="flex-1 min-w-0"
                      placeholder="e.g. 123456789"
                      {...field}
                    />
                  </FormControl>
                  <Button 
                    type="submit" 
                    className="ml-3"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Tracking...' : 'Track'}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default TrackOrder;
