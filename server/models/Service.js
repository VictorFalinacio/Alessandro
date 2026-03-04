import mongoose from 'mongoose';

const quoteItemSchema = new mongoose.Schema({
    partName: { type: String, required: true },
    price: { type: Number, required: true }
});

const serviceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    checklistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Checklist',
        required: true
    },
    workshopName: {
        type: String,
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true // quem levou
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Em andamento', 'Concluído'],
        default: 'Em andamento'
    },
    quotes: [quoteItemSchema],
    totalValue: {
        type: Number
    },
    endDate: {
        type: Date
    },
    retrievalDriverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' // quem buscou
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;
