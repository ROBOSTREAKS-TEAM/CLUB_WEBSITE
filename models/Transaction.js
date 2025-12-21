import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    componentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Component', required: true },
    componentName: String,
    
    // Usage Details
    usageType: { type: String, enum: ['individual', 'project'], default: 'individual' },
    projectName: { type: String, default: '' },
    
    // User Details
    studentName: { type: String, required: true },
    clubRegNo: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    purpose: { type: String, default: '' },
    
    // Verification
    isWorkingVerified: { type: Boolean, default: false },
    
    // Dates
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    
    // Return Info (NEW)
    returnCondition: { type: String, enum: ['Good', 'Damaged', 'Pending'], default: 'Pending' },

    status: { 
        type: String, 
        // Added 'damaged' to status enum
        enum: ['pending', 'approved', 'returned', 'damaged', 'rejected'], 
        default: 'pending' 
    }
}, { timestamps: true });

export default mongoose.model('Transaction', TransactionSchema);