import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  logId: string;
  userId?: string;
  operatorId?: string;
  role: string;
  action: string;
  description: string;
  relatedFarmerId?: string;
  relatedTransactionId?: string;
  ipAddress?: string;
  deviceInfo?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  logId: { type: String, required: true, unique: true },
  userId: { type: String },
  operatorId: { type: String },
  role: { type: String, required: true },
  action: { type: String, required: true },
  description: { type: String, required: true },
  relatedFarmerId: { type: String },
  relatedTransactionId: { type: String },
  ipAddress: { type: String },
  deviceInfo: { type: String },
}, { timestamps: true });

ActivityLogSchema.index({ operatorId: 1 });
ActivityLogSchema.index({ action: 1 });
ActivityLogSchema.index({ createdAt: -1 });

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
