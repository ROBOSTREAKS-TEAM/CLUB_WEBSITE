import mongoose from 'mongoose';

const ComponentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    componentNumber: { type: String, default: '' }, // NEW: Unique ID/Part Number
    category: { type: String, default: 'General' },
    
    // Inventory Counts
    totalStock: { type: Number, required: true, default: 0 },
    availableStock: { type: Number, required: true, default: 0 },
    
    // Details
    location: { type: String, default: 'General Storage' },
    description: { type: String, default: '' },
    price: { type: Number, default: 0 }, // Price per piece
    datasheet: { type: String, default: '' },
    image: { type: String, default: '' },
    
    // Status
    stockStatus: { type: String, enum: ['Available', 'Club Use Only'], default: 'Available' }, // NEW

    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Component', ComponentSchema);