import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Próprio', 'Terceirizado'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
