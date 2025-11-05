import mongoose from 'mongoose';
const { Schema } = mongoose;

const ClientSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String }
}, { timestamps: true });

export default mongoose.models.Client || mongoose.model('Client', ClientSchema);
