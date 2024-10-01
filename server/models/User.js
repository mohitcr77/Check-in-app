import mongoose, { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
},
email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
},
password: {
    type: String,
    required: true,
    minlength: 6,
},
role: {
    type: String,
    enum: ['employee', 'admin'],
    default: 'employee',
},
organization: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Organization'
}
}, { timestamps: true });

const User = model('User', UserSchema);

export default User;
