export type PaymentMethod = 'mpesa' | 'cash' | 'bank' | 'other';
export type AgreementStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface PaymentAgreement {
  id: number;
  chatRoomId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  terms?: string;
  status: AgreementStatus;
  createdAt: string;
  updatedAt?: string;
  clientId?: number;
  providerId?: number;
}

export interface CreateAgreementDto {
  amount: number;
  paymentMethod: PaymentMethod;
  terms?: string;
}