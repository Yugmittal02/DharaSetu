import mongoose, { Schema } from 'mongoose';

export interface ICounter {
  _id: string;
  prefix: string;
  currentSequence: number;
  updatedAt: Date;
}

const CounterSchema = new Schema({
  _id: { type: String, required: true },
  prefix: { type: String, required: true },
  currentSequence: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

export async function getNextSequence(counterId: string, prefix: string, padLength: number = 4): Promise<string> {
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { 
      $inc: { currentSequence: 1 }, 
      $set: { updatedAt: new Date(), prefix } 
    },
    { new: true, upsert: true }
  );
  const seq = String(counter.currentSequence).padStart(padLength, '0');
  return `${prefix}${seq}`;
}

export default Counter;
