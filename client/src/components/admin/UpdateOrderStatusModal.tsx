import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { OrderStatus } from '@shared/schema';
import { UpdateOrderStatusModalProps } from '@/lib/types';
import { statusNames } from '@/lib/utils';

const statusOptions: OrderStatus[] = ['pending', 'in_progress', 'delivered'];

const UpdateOrderStatusModal = ({ 
  isOpen, 
  order, 
  onClose, 
  onUpdateStatus 
}: UpdateOrderStatusModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(
    order?.status as OrderStatus
  );
  const [statusNotes, setStatusNotes] = useState('');
  
  // Reset form when modal opens with a new order
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
    if (open && order) {
      setSelectedStatus(order.status as OrderStatus);
      setStatusNotes('');
    }
  };
  
  const handleSubmit = () => {
    if (order && selectedStatus) {
      onUpdateStatus(order.id, selectedStatus);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">
                Order ID: <span className="font-medium text-gray-900">#{order?.id}</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Customer: <span className="font-medium text-gray-900">{order?.customerName}</span>
              </p>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="order-status">
              Current Status: <span className="text-primary-500 font-medium">
                {order?.status && statusNames[order.status as keyof typeof statusNames]}
              </span>
            </Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
            >
              <SelectTrigger id="order-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusNames[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="status-notes">Notes (optional)</Label>
            <Textarea
              id="status-notes"
              placeholder="Add any additional notes about this status update"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!selectedStatus || selectedStatus === order?.status}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateOrderStatusModal;
