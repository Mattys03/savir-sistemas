import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  login: { type: String, required: true },
  profile: { type: String, enum: ['Administrador','Usuário'], default: 'Usuário' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
