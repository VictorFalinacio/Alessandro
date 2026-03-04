import mongoose from 'mongoose';

const checklistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleBrand: {
        type: String,
        required: true
    },
    vehicleModel: {
        type: String,
        required: true
    },
    vehiclePlate: {
        type: String,
        required: true
    },
    mileage: {
        type: Number,
        required: true
    },
    fuelLiters: {
        type: Number,
        required: true
    },
    damages: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Checklist = mongoose.model('Checklist', checklistSchema);
export default Checklist;
