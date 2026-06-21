import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletTransaction extends Document {
  transactionId: string;
  operatorId: string;
  operatorName: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  selectedPackageId?: string;
  selectedPackageName?: string;
  relatedFarmerId?: string;
  reason: string;
  paymentMode?: string;
  referenceNumber?: string;
  remarks?: string;
  createdBy: string;
  createdAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>({
  transactionId: { type: String, required: true, unique: true },
  operatorId: { type: String, required: true },
  operatorName: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  selectedPackageId: { type: String },
  selectedPackageName: { type: String },
  relatedFarmerId: { type: String },
  reason: { type: String, required: true },
  paymentMode: { type: String },
  referenceNumber: { type: String },
  remarks: { type: String },
  createdBy: { type: String, required: true },
}, { timestamps: true });

WalletTransactionSchema.index({ transactionId: 1 }, { unique: true });
WalletTransactionSchema.index({ operatorId: 1 });
WalletTransactionSchema.index({ createdAt: -1 });
WalletTransactionSchema.index({ type: 1 });

export default mongoose.models.WalletTransaction || mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);
