import mongoose from 'mongoose';

const RoboDataSchema = new mongoose.Schema({
    category: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

export default mongoose.model('RoboData', RoboDataSchema);