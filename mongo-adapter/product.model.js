import mongoose from 'mongoose';
const { Schema } = mongoose;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
