import { useEffect, useState } from 'react';
import { Search, X, CheckCircle, AlertCircle, Package, FileText, ShoppingCart, Trash2, Plus, Minus, Calendar, User, Phone, Mail } from 'lucide-react';

interface Component {
  _id: string;
  name: string;
  category: string;
  totalStock: number;
  availableStock: number;
  stockStatus?: string; // "Available" or "Club Use Only"
  image?: string;
  description?: string;
  location?: string;
  datasheet?: string;
}

interface CartItem extends Component {
  quantity: number;
}

const InventoryPage = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  // Modal State
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({ 
    studentName: '', 
    clubRegNo: '', 
    phoneNumber: '',
    email: '',
    purpose: '',
    returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    verified: false,
    agreed: false
  });

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // --- 1. FETCH ---
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch('/admin/api/public/inventory');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setComponents(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // --- 2. CART ACTIONS ---
  const addToCart = (component: Component) => {
    // STRICT GUARD: Prevent adding if it's Club Use Only
    if (component.stockStatus === 'Club Use Only') return;

    setCart(prev => {
      const existing = prev.find(item => item._id === component._id);
      if (existing) {
        if (existing.quantity + 1 > component.availableStock) return prev;
        return prev.map(item => item._id === component._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...component, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQty = item.quantity + delta;
        if (newQty > 0 && newQty <= item.availableStock) return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // --- 3. CHECKOUT ---
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.verified || !formData.agreed) {
        setSubmitStatus('error');
        setStatusMessage("You must verify working condition and agree to terms.");
        return;
    }

    setSubmitStatus('loading');

    const itemsPayload = cart.map(item => ({
      componentId: item._id,
      quantity: item.quantity
    }));

    try {
      const response = await fetch('/admin/api/public/inventory/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsPayload,
          ...formData
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed');

      setSubmitStatus('success');
      setStatusMessage(result.message);
      
      setTimeout(() => {
        setCart([]); 
        setIsCartOpen(false);
        setSubmitStatus('idle');
        setFormData({ 
            studentName: '', clubRegNo: '', phoneNumber: '', email: '', purpose: '', 
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            verified: false, agreed: false 
        });
      }, 3000);

    } catch (error: any) {
      setSubmitStatus('error');
      setStatusMessage(error.message);
    }
  };

  const filteredComponents = components.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filter === "All" || item.category === filter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...new Set(components.map(c => c.category))];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 15);
  const maxDateStr = maxDate.toISOString().split('T')[0];
  const minDateStr = new Date().toISOString().split('T')[0];

  return (
    <div className="pt-24 min-h-screen bg-[#0d1117] text-white relative pb-24">
      <div className="container mx-auto px-4 py-8">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-400">Component Library</h1>
          <p className="text-gray-400">Add components to your cart and issue them in one go.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 justify-center items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input 
              type="text" placeholder="Search components..." 
              className="w-full bg-[#161b22] border border-gray-700 rounded-full py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-gray-500"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-[#161b22] border border-gray-700 rounded-full px-6 py-3 focus:outline-none focus:border-blue-500 cursor-pointer text-white"
            value={filter} onChange={(e) => setFilter(e.target.value)}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredComponents.map((item) => {
            const inCart = cart.find(c => c._id === item._id);
            const cartQty = inCart ? inCart.quantity : 0;
            
            // --- LOGIC: UNAVAILABLE IF CLUB USE ---
            const isClubUse = item.stockStatus === 'Club Use Only';
            const canAdd = !isClubUse && item.availableStock > cartQty;

            // --- BADGE STYLING ---
            let badgeClass = 'bg-red-900/80 text-red-300 border-red-500/50';
            let badgeText = 'Out of Stock';

            if (isClubUse) {
                // YELLOW BADGE FOR CLUB USE
                badgeClass = 'bg-yellow-900/80 text-yellow-300 border-yellow-500/50';
                badgeText = 'Unavailable (Club Use)';
            } else if (item.availableStock > 0) {
                badgeClass = 'bg-green-900/80 text-green-300 border-green-500/50';
                badgeText = `${item.availableStock} of ${item.totalStock} Available`;
            }

            return (
              <div key={item._id} className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all flex flex-col h-full group">
                <div className="h-48 bg-black/40 relative overflow-hidden flex items-center justify-center p-4 border-b border-gray-800">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                  ) : (
                    <Package className="h-16 w-16 text-gray-700" />
                  )}
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                    {badgeText}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-xs text-blue-400 font-bold uppercase mb-2">{item.category}</div>
                  <h3 className="text-lg font-bold mb-2 text-white">{item.name}</h3>
                  {item.description && <p className="text-sm text-gray-400 mb-4 line-clamp-2">{item.description}</p>}
                  
                  {item.datasheet && (
                    <a href={item.datasheet} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center text-gray-500 hover:text-blue-400 mb-4 mt-auto">
                      <FileText className="h-3 w-3 mr-1" /> Datasheet
                    </a>
                  )}

                  <div className="mt-4">
                    {/* BUTTON LOGIC */}
                    {canAdd ? (
                      <button onClick={() => addToCart(item)} className="w-full py-2.5 rounded-lg font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center justify-center gap-2">
                        <Plus size={16} /> Add to Cart {cartQty > 0 && `(${cartQty})`}
                      </button>
                    ) : (
                      <button disabled className="w-full py-2.5 rounded-lg font-bold text-sm bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700 opacity-60">
                        {isClubUse ? 'Unavailable' : (item.availableStock === 0 ? 'Out of Stock' : 'Max Limit Reached')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- FLOATING CART BUTTON --- */}
      {cart.length > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl shadow-blue-500/30 z-40 transition-transform hover:scale-110 flex items-center justify-center"
        >
          <ShoppingCart size={28} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0d1117]">
            {cart.reduce((a, b) => a + b.quantity, 0)}
          </span>
        </button>
      )}

      {/* --- CART MODAL --- */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-[#0d1117]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart size={20} className="text-blue-400" /> Checkout
              </h2>
              <button onClick={() => setIsCartOpen(false)}><X size={24} className="text-gray-400 hover:text-white" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Items List */}
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                  <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Requested Components</h3>
                  {cart.map(item => (
                    <div key={item._id} className="flex justify-between items-center bg-[#0d1117] p-3 rounded-lg border border-gray-700 mb-2 last:mb-0">
                      <div>
                        <h4 className="font-bold text-white">{item.name}</h4>
                        <p className="text-xs text-gray-500">ID: {item._id.slice(-6)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-800 rounded-lg">
                          <button onClick={() => updateQuantity(item._id, -1)} className="p-1 hover:text-blue-400 px-2"><Minus size={14} /></button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, 1)} className="p-1 hover:text-blue-400 px-2"><Plus size={14} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
              </div>

              {submitStatus === 'success' ? (
                <div className="text-center py-10 text-green-400 animate-in zoom-in">
                  <CheckCircle size={50} className="mx-auto mb-4" />
                  <p className="font-bold text-xl">Request Submitted!</p>
                  <p className="text-gray-400 text-sm mt-2">Visit the club to collect your items.</p>
                </div>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Student Details</h3>
                  
                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-2.5 text-gray-500"/>
                        <input required type="text" className="w-full bg-[#0d1117] border border-gray-600 rounded p-2 pl-9 text-sm text-white focus:border-blue-500 outline-none" 
                          value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Club Reg No.</label>
                      <div className="relative">
                        <FileText size={16} className="absolute left-3 top-2.5 text-gray-500"/>
                        <input required type="text" className="w-full bg-[#0d1117] border border-gray-600 rounded p-2 pl-9 text-sm text-white focus:border-blue-500 outline-none" 
                          value={formData.clubRegNo} onChange={e => setFormData({...formData, clubRegNo: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Phone Number</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-2.5 text-gray-500"/>
                        <input required type="tel" className="w-full bg-[#0d1117] border border-gray-600 rounded p-2 pl-9 text-sm text-white focus:border-blue-500 outline-none" 
                          value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Email Address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-2.5 text-gray-500"/>
                        <input required type="email" className="w-full bg-[#0d1117] border border-gray-600 rounded p-2 pl-9 text-sm text-white focus:border-blue-500 outline-none" 
                          value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  {/* Purpose & Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Purpose of Issue</label>
                      <input required type="text" placeholder="Project Name / Learning" className="w-full bg-[#0d1117] border border-gray-600 rounded p-2 text-sm text-white focus:border-blue-500 outline-none" 
                        value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Return Date (Max 15 Days)</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-2.5 text-gray-500"/>
                        <input required type="date" min={minDateStr} max={maxDateStr} className="w-full bg-[#0d1117] border border-gray-600 rounded p-2 pl-9 text-sm text-white focus:border-blue-500 outline-none" 
                          value={formData.returnDate} onChange={e => setFormData({...formData, returnDate: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  {/* Terms & Verification */}
                  <div className="space-y-3 bg-blue-900/10 p-4 rounded-lg border border-blue-500/20">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" className="mt-1 w-4 h-4 accent-blue-500" 
                        checked={formData.verified} onChange={e => setFormData({...formData, verified: e.target.checked})} />
                      <span className="text-sm text-gray-300 group-hover:text-white">
                        I verify that the component(s) are in <strong>working condition</strong> at the time of issuance.
                      </span>
                    </label>
                    
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" className="mt-1 w-4 h-4 accent-blue-500" 
                        checked={formData.agreed} onChange={e => setFormData({...formData, agreed: e.target.checked})} />
                      <span className="text-sm text-gray-300 group-hover:text-white">
                        I agree to the <strong>Terms & Conditions</strong>: The component shall be returned or renewed within 15 days. It must be returned in working condition and verified by a club coordinator.
                      </span>
                    </label>
                  </div>

                  {submitStatus === 'error' && <p className="text-red-400 text-sm flex items-center gap-2 bg-red-900/20 p-2 rounded"><AlertCircle size={14}/> {statusMessage}</p>}

                  <button disabled={submitStatus === 'loading'} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20">
                    {submitStatus === 'loading' ? 'Submitting Request...' : 'Confirm Issuance'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryPage;