import mongoose, { Schema, Document } from 'mongoose';

export interface IFarmer extends Document {
  farmerId: string;
  farmerName: string;
  fatherOrHusbandName: string;
  mobile: string;
  alternateMobile?: string;
  gender: string;
  age: number;
  address: string;
  village: string;
  gramPanchayat: string;
  block: string;
  tehsil?: string;
  district: string;
  state: string;
  pincode: string;
  aadhaarMasked?: string;
  aadhaarLast4?: string;
  panMasked?: string;
  pan?: string;
  janAadhaar?: string;
  bankAvailable: string;
  farmerType: string;
  landSize?: string;
  landUnit?: string;
  cropName?: string;
  cropSeason?: string;
  expectedQuantity?: string;
  irrigationSource?: string;
  landLocation?: string;
  landownerName?: string;
  landownerMobile?: string;
  consentAvailable?: string;
  fpoMember?: string;
  warehouseInterest?: string;
  bankLoanInterest?: string;
  kccAvailable?: string;
  currentRequirement?: string;
  serviceRequired: string[];
  selectedPackageId: string;
  selectedPackageName: string;
  packageAmount: number;
  operatorCommission: number;
  companyShare: number;
  addedByOperatorId: string;
  addedByOperatorName: string;
  operatorFarmerSerial: number;
  status: 'pending' | 'verified' | 'rejected' | 'under_review' | 'submitted_to_bank' | 'submitted_to_warehouse' | 'completed';
  adminRemarks?: string;
  consentAccepted: boolean;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerSchema = new Schema<IFarmer>({
  farmerId: { type: String, required: true, unique: true },
  farmerName: { type: String, required: true },
  fatherOrHusbandName: { type: String, required: true },
  mobile: { type: String, required: true },
  alternateMobile: { type: String },
  gender: { type: String, required: true },
  age: { type: Number, required: true },
  address: { type: String, required: true },
  village: { type: String, required: true },
  gramPanchayat: { type: String, required: true },
  block: { type: String, required: true },
  tehsil: { type: String },
  district: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  aadhaarMasked: { type: String },
  aadhaarLast4: { type: String },
  panMasked: { type: String },
  pan: { type: String },
  janAadhaar: { type: String },
  bankAvailable: { type: String, default: 'No' },
  farmerType: { type: String, required: true },
  landSize: { type: String },
  landUnit: { type: String },
  cropName: { type: String },
  cropSeason: { type: String },
  expectedQuantity: { type: String },
  irrigationSource: { type: String },
  landLocation: { type: String },
  landownerName: { type: String },
  landownerMobile: { type: String },
  consentAvailable: { type: String },
  fpoMember: { type: String },
  warehouseInterest: { type: String },
  bankLoanInterest: { type: String },
  kccAvailable: { type: String },
  currentRequirement: { type: String },
  serviceRequired: [{ type: String }],
  selectedPackageId: { type: String, required: true },
  selectedPackageName: { type: String, required: true },
  packageAmount: { type: Number, required: true },
  operatorCommission: { type: Number, required: true },
  companyShare: { type: Number, required: true },
  addedByOperatorId: { type: String, required: true },
  addedByOperatorName: { type: String, required: true },
  operatorFarmerSerial: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected', 'under_review', 'submitted_to_bank', 'submitted_to_warehouse', 'completed'],
    default: 'pending' 
  },
  adminRemarks: { type: String },
  consentAccepted: { type: Boolean, required: true },
  idempotencyKey: { type: String, required: true, unique: true },
}, { timestamps: true });

FarmerSchema.index({ farmerId: 1 }, { unique: true });
FarmerSchema.index({ mobile: 1 });
FarmerSchema.index({ addedByOperatorId: 1 });
FarmerSchema.index({ village: 1 });
FarmerSchema.index({ block: 1 });
FarmerSchema.index({ status: 1 });
FarmerSchema.index({ selectedPackageId: 1 });
FarmerSchema.index({ createdAt: -1 });
FarmerSchema.index({ idempotencyKey: 1 }, { unique: true });

export default mongoose.models.Farmer || mongoose.model<IFarmer>('Farmer', FarmerSchema);
