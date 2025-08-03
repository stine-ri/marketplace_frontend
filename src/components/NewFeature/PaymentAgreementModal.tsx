// components/PaymentAgreementModal.tsx
import { useState } from 'react';
import { Dialog } from '@headlessui/react';

interface PaymentAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatRoomId: number;
  onAgreementReached: (agreement: {
    amount: number;
    paymentMethod: string;
    terms: string;
  }) => void;
}

export function PaymentAgreementModal({
  isOpen,
  onClose,
  chatRoomId,
  onAgreementReached
}: PaymentAgreementModalProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [terms, setTerms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onAgreementReached({
        amount: parseFloat(amount),
        paymentMethod,
        terms
      });
      onClose();
    } catch (error) {
      console.error('Error creating agreement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
  <div className="flex items-center justify-center min-h-screen">
    {/* Custom overlay */}
    <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />

    <div className="relative bg-white rounded-lg max-w-md mx-auto p-6">
      <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
        Create Payment Agreement
      </Dialog.Title>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (KSh)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="mpesa">M-Pesa</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Terms & Conditions
          </label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Describe the terms of payment..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Agreement'}
          </button>
        </div>
      </form>
    </div>
  </div>
</Dialog>

  );
}