import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import RoboData from '../models/RoboData.js';
import Component from '../models/Component.js';
import Transaction from '../models/Transaction.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==========================================
// 1. PUBLIC APIS
// ==========================================
router.get('/api/public/inventory', async (req, res) => {
    try {
        const components = await Component.find({}, 'name category availableStock totalStock image description datasheet stockStatus componentNumber');
        res.json(components);
    } catch (e) {
        res.status(500).json({ error: "Error fetching inventory" });
    }
});

router.post('/api/public/inventory/request', async (req, res) => {
    const { items, studentName, rollNumber, days, clubRegNo, phoneNumber, email, purpose } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Cart is empty" });

    try {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + parseInt(days || 7));

        for (const item of items) {
            const comp = await Component.findById(item.componentId);
            if(comp) {
                if (comp.stockStatus === 'Club Use Only') continue;
                for (let i = 0; i < item.quantity; i++) {
                    await Transaction.create({
                        componentId: comp._id,
                        componentName: comp.name,
                        studentName, rollNumber, clubRegNo, phoneNumber, email, purpose,
                        dueDate, status: 'pending'
                    });
                }
            }
        }
        res.json({ success: true, message: "Request submitted! Approval pending." });
    } catch (e) {
        res.status(500).json({ error: "Server Error: " + e.message });
    }
});

// ==========================================
// 2. AUTH & DASHBOARD
// ==========================================
router.get('/', (req, res) => res.redirect('/admin/login'));

router.get('/login', (req, res) => {
    if (req.cookies.token) return res.redirect('/admin/dashboard');
    res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.cookie('token', token, { httpOnly: true });
            return res.redirect('/admin/dashboard');
        }
        res.render('login', { error: 'Invalid credentials' });
    } catch (err) {
        res.render('login', { error: 'Login failed: ' + err.message });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin/login');
});

// DASHBOARD ROUTE (Updated to send User List to Superadmin)
router.get('/dashboard', protect, async (req, res) => {
    let users = [];
    if (req.user.role === 'superadmin') {
        users = await User.find({}, '-password'); // Fetch all users, hide passwords
    }
    res.render('dashboard', { user: req.user, users });
});

// ==========================================
// 3. INVENTORY MANAGEMENT
// ==========================================
router.get('/inventory/dashboard', protect, async (req, res) => {
    try {
        const components = await Component.find({});
        const transactions = await Transaction.find({ status: { $in: ['pending', 'approved'] } }).sort({ createdAt: -1 });
        
        const today = new Date();
        const notifications = transactions
            .filter(t => t.status === 'approved' && new Date(t.dueDate) < today)
            .map(t => ({
                message: `Overdue: ${t.studentName || t.projectName} has not returned ${t.componentName}`,
                date: t.dueDate
            }));

        res.json({ components, transactions, notifications });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/inventory/logs', protect, async (req, res) => {
    try {
        const logs = await Transaction.find({}).sort({ issueDate: -1 });
        res.json(logs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/inventory/add', protect, async (req, res) => {
    const { id, name, componentNumber, totalStock, category, image, description, price, datasheet, stockStatus } = req.body;
    try {
        if (id && typeof id === 'string' && id.trim().length > 10) {
            await Component.findByIdAndUpdate(id, { name, componentNumber, totalStock: parseInt(totalStock), category, image, description, price: parseFloat(price) || 0, datasheet, stockStatus });
        } else {
            const existing = await Component.findOne({ name });
            if (existing) return res.send("Error: Component exists.");
            await Component.create({ name, componentNumber, totalStock: parseInt(totalStock), availableStock: parseInt(totalStock), category, image, description, price: parseFloat(price) || 0, datasheet, stockStatus });
        }
        res.redirect('/admin/dashboard');
    } catch (e) {
        res.send("Error: " + e.message);
    }
});

router.post('/inventory/delete', protect, async (req, res) => {
    try { await Component.findByIdAndDelete(req.body.id); res.redirect('/admin/dashboard'); } 
    catch (e) { res.send("Error: " + e.message); }
});

router.post('/inventory/request', protect, async (req, res) => {
    const { componentId, usageType, studentName, rollNumber, projectName, days } = req.body;
    try {
        const comp = await Component.findById(componentId);
        if(comp.availableStock < 1) return res.send("Error: Out of stock");
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + parseInt(days || 7));
        
        const data = {
            componentId, componentName: comp.name, issueDate: new Date(), dueDate,
            status: 'approved', usageType: usageType || 'individual'
        };
        if (usageType === 'project') { data.projectName = projectName; data.studentName = "Club Project"; data.rollNumber = "INTERNAL"; } 
        else { data.studentName = studentName; data.rollNumber = rollNumber; }

        await Transaction.create(data);
        comp.availableStock -= 1;
        await comp.save();
        res.redirect('/admin/dashboard');
    } catch (e) { res.send("Error: " + e.message); }
});

router.post('/inventory/approve', protect, adminOnly, async (req, res) => {
    const { transactionId, action } = req.body;
    try {
        const trans = await Transaction.findById(transactionId);
        const comp = await Component.findById(trans.componentId);
        if (action === 'approve') {
            if (comp.availableStock > 0) {
                comp.availableStock -= 1; trans.status = 'approved';
                await comp.save(); await trans.save();
            } else return res.send("Error: Stock unavailable");
        } else if (action === 'reject') {
            trans.status = 'rejected'; await trans.save();
        }
        res.redirect('/admin/dashboard');
    } catch (e) { res.send("Error: " + e.message); }
});

router.post('/inventory/return', protect, async (req, res) => {
    const { transactionId, condition } = req.body;
    try {
        const trans = await Transaction.findById(transactionId);
        const comp = await Component.findById(trans.componentId);
        if (trans.status === 'approved') {
            trans.returnDate = new Date(); trans.returnCondition = condition || 'Good';
            if (condition === 'Good') { comp.availableStock += 1; trans.status = 'returned'; } 
            else { trans.status = 'damaged'; }
            await comp.save(); await trans.save();
        }
        res.redirect('/admin/dashboard');
    } catch (e) { res.send("Error: " + e.message); }
});

// ==========================================
// 4. CMS & USER MANAGEMENT
// ==========================================
router.get('/api/data/:category',  async (req, res) => {
    try {
        const doc = await RoboData.findOne({ category: req.params.category });
        res.json(doc ? doc.data : []);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/update-data', protect, async (req, res) => {
    try {
        await RoboData.findOneAndUpdate({ category: req.body.category }, { data: JSON.parse(req.body.jsonData) }, { upsert: true });
        res.json({ success: true });
    } catch(e) { res.status(400).json({ error: "Invalid JSON" }); }
});

// CREATE NEW ADMIN (Super Admin Only)
router.post('/create-admin', protect, adminOnly, async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const existing = await User.findOne({ username });
        if(existing) return res.send("User already exists");
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword, role });
        res.redirect('/admin/dashboard');
    } catch (e) { res.send("Error creating user: " + e.message); }
});

// DELETE ADMIN (Super Admin Only)
router.post('/delete-admin', protect, adminOnly, async (req, res) => {
    try {
        if (req.body.userId !== req.user.id) await User.findByIdAndDelete(req.body.userId);
        res.redirect('/admin/dashboard');
    } catch(e) { res.send("Error deleting user"); }
});

router.get('/backup', protect, adminOnly, async (req, res) => {
    const allData = await RoboData.find({});
    const backup = {};
    allData.forEach(doc => backup[doc.category] = doc.data);
    res.json(backup);
});

export default router;