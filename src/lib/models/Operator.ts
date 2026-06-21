import mongoose, { Schema, Document } from 'mongoose';

export interface IOperator extends Document {
  operatorId: string;
  operatorName: string;
  mobile: string;
  alternateMobile?: string;
  shopName: string;
  cscId?: string;
  village: string;
  gramPanchayat: string;
  block: string;
  tehsil?: string;
  district: string;
  state: string;
  address: string;
  aadhaarLast4?: string;
  pan?: string;
  bankAccountHolder: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  walletBalance: number;
  commissionConfig: {
    package149: number;
    package249: number;
  };
  status: 'active' | 'suspended' | 'pending';
  appOpenCount: number;
  lastLoginAt?: Date;
  lastAppOpenAt?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const OperatorSchema = new Schema<IOperator>({
  operatorId: { type: String, required: true, unique: true },
  operatorName: { type: String, required: true },
  mobile: { type: String, required: true },
  alternateMobile: { type: String },
  shopName: { type: String, required: true },
  cscId: { type: String },
  village: { type: String, required: true },
  gramPanchayat: { type: String, required: true },
  block: { type: String, required: true },
  tehsil: { type: String },
  district: { type: String, required: true },
  state: { type: String, required: true },
  address: { type: String, required: true },
  aadhaarLast4: { type: String },
  pan: { type: String },
  bankAccountHolder: { type: String, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifsc: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  commissionConfig: {
    package149: { type: Number, default: 50 },
    package249: { type: Number, default: 100 },
  },
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  appOpenCount: { type: Number, default: 0 },
  lastLoginAt: { type: Date },
  lastAppOpenAt: { type: Date },
  notes: { type: String },
  createdBy: { type: String, required: true },
}, { timestamps: true });

OperatorSchema.index({ operatorId: 1 }, { unique: true });
OperatorSchema.index({ mobile: 1 });
OperatorSchema.index({ status: 1 });
OperatorSchema.index({ village: 1 });
OperatorSchema.index({ block: 1 });
OperatorSchema.index({ createdAt: -1 });

export default mongoose.models.Operator || mongoose.model<IOperator>('Operator', OperatorSchema);
