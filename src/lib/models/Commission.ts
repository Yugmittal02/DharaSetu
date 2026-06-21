import mongoose, { Schema, Document } from 'mongoose';

export interface ICommission extends Document {
  commissionId: string;
  operatorId: string;
  operatorName: string;
  farmerId: string;
  selectedPackageName: string;
  packageAmount: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'hold';
  createdAt: Date;
  paidAt?: Date;
}

const CommissionSchema = new Schema<ICommission>({
  commissionId: { type: String, required: true, unique: true },
  operatorId: { type: String, required: true },
  operatorName: { type: String, required: true },
  farmerId: { type: String, required: true },
  selectedPackageName: { type: String, required: true },
  packageAmount: { type: Number, required: true },
  commissionAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'paid', 'hold'], default: 'pending' },
  paidAt: { type: Date },
}, { timestamps: true });

CommissionSchema.index({ commissionId: 1 }, { unique: true });
CommissionSchema.index({ operatorId: 1 });
CommissionSchema.index({ farmerId: 1 });
CommissionSchema.index({ status: 1 });

export default mongoose.models.Commission || mongoose.model<ICommission>('Commission', CommissionSchema);
