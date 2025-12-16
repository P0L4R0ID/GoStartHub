'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Check } from 'lucide-react';
import { purchaseOnDemand } from '@/lib/subscription';

interface OnDemandPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'startup_listing' | 'mentorship_token';
  price: number;
  userId: string;
  onSuccess?: () => void;
}

export default function OnDemandPurchaseDialog({
  open,
  onOpenChange,
  type,
  price,
  userId,
  onSuccess,
}: OnDemandPurchaseDialogProps) {
  const handlePurchase = () => {
    // In a real system, this would integrate with a payment gateway
    // For now, we'll simulate a successful purchase
    const result = purchaseOnDemand(userId, type);
    
    if (result.success) {
      alert(`Successfully purchased ${type === 'startup_listing' ? 'startup listing' : 'mentorship token'}!`);
      onSuccess?.();
      onOpenChange(false);
    } else {
      alert(result.error || 'Purchase failed. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase {type === 'startup_listing' ? 'Startup Listing' : 'Mentorship Token'}</DialogTitle>
          <DialogDescription>
            {type === 'startup_listing' 
              ? 'Purchase an additional startup listing to showcase your innovation.'
              : 'Purchase an additional mentorship token to connect with mentors.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Price:</span>
                <span className="text-2xl font-bold">RM {price}</span>
              </div>
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2">What you get:</p>
            <ul className="list-disc list-inside space-y-1">
              {type === 'startup_listing' ? (
                <>
                  <li>1 additional startup listing</li>
                  <li>Valid for 1 year</li>
                  <li>All standard listing features</li>
                </>
              ) : (
                <>
                  <li>1 mentorship token (30 minutes)</li>
                  <li>Valid for 1 year</li>
                  <li>Connect with any available mentor</li>
                </>
              )}
            </ul>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Note:</strong> In production, this would integrate with a payment gateway (e.g., Stripe, iPay88).
              For demo purposes, the purchase is automatically completed.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Purchase for RM {price}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

