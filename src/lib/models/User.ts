import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  mobile: string;
  email?: string;
  passwordHash: string;
  role: 'super_admin' | 'admin' | 'operator';
  operatorId?: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin', 'operator'], required: true },
  operatorId: { type: String },
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
}, { timestamps: true });

UserSchema.index({ mobile: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ operatorId: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
