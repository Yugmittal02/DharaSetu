import mongoose, { Schema } from 'mongoose';

export interface ISettings {
  _id: string;
  servicePackages: {
    package149: {
      name: string;
      price: number;
      commission: number;
      companyShare: number;
      description: string;
      features: string[];
    };
    package249: {
      name: string;
      price: number;
      commission: number;
      companyShare: number;
      description: string;
      features: string[];
    };
  };
  minimumWalletWarning: number;
  appNotice?: string;
  supportContact?: string;
  exportLimit: number;
  maintenanceMode: boolean;
  updatedAt: Date;
}

const SettingsSchema = new Schema({
  _id: { type: String, default: 'global_settings' },
  servicePackages: {
    package149: {
      name: { type: String, default: 'Farmer Basic Registration' },
      price: { type: Number, default: 149 },
      commission: { type: Number, default: 50 },
      companyShare: { type: Number, default: 99 },
      description: { type: String, default: 'Basic farmer profile with crop and land details' },
      features: { type: [String], default: ['Basic farmer profile', 'Crop and land details', 'Service interest record', 'Farmer acknowledgement ID'] },
    },
    package249: {
      name: { type: String, default: 'Farmer Complete Documentation' },
      price: { type: Number, default: 249 },
      commission: { type: Number, default: 100 },
      companyShare: { type: Number, default: 149 },
      description: { type: String, default: 'Complete documentation with bank/FPO/warehouse details' },
      features: { type: [String], default: ['Complete farmer profile', 'Crop, land and batai/tenant details', 'Bank/FPO/warehouse interest details', 'Documentation readiness details', 'Farmer acknowledgement ID'] },
    },
  },
  minimumWalletWarning: { type: Number, default: 300 },
  appNotice: { type: String },
  supportContact: { type: String, default: '+91 9999999999' },
  exportLimit: { type: Number, default: 5000 },
  maintenanceMode: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
