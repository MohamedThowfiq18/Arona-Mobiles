'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  DollarSign, 
  Package, 
  ShoppingBag, 
  Repeat, 
  Wrench, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  RefreshCw,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';
import { Product, ProductCondition, ProductGrade } from '@/types';

export default function AdminDashboardPage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(true); // Default unlocked for easy demo
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'tradeins' | 'repairs'>('inventory');
  
  const { products, addProduct, updateProduct, deleteProduct, addToast } = useProductStore();

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [formBrand, setFormBrand] = useState('Apple');
  const [formModel, setFormModel] = useState('');
  const [formCondition, setFormCondition] = useState<ProductCondition>('new');
  const [formGrade, setFormGrade] = useState<ProductGrade>('A+');
  const [formPrice, setFormPrice] = useState(999);
  const [formStock, setFormStock] = useState(10);
  const [formBadge, setFormBadge] = useState('New Arrival');
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80');

  // Specs Form State
  const [specDisplay, setSpecDisplay] = useState('6.7-inch OLED, 120Hz');
  const [specProcessor, setSpecProcessor] = useState('A17 Pro / Snapdragon 8 Gen 3');
  const [specCamera, setSpecCamera] = useState('48MP Main + Telephoto');
  const [specBattery, setSpecBattery] = useState('4500 mAh');

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput.toLowerCase() === 'admin') {
      setIsAdminAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formModel.trim()) return;

    await addProduct({
      brand: formBrand,
      model: formModel,
      condition: formCondition,
      gradeIfPreowned: formCondition === 'preowned' ? formGrade : undefined,
      price: Number(formPrice),
      originalPrice: Number(formPrice) + 150,
      stock: Number(formStock),
      badge: formBadge || undefined,
      rating: 5.0,
      reviewsCount: 1,
      images: [formImage],
      variants: [
        { storage: '256GB', color: 'Default', priceModifier: 0, stock: Number(formStock) }
      ],
      specs: {
        display: specDisplay,
        processor: specProcessor,
        camera: specCamera,
        battery: specBattery,
        os: formBrand === 'Apple' ? 'iOS 17' : 'Android 14',
        connectivity: '5G'
      }
    });

    setShowAddModal(false);
    setFormModel('');
  };

  const totalRevenue = 48290;
  const activeOrdersCount = 14;
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);

  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="glass-panel p-8 rounded-3xl border border-amber-500/40 text-center space-y-6 bg-slate-950">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl font-bold font-display text-white">ARONA Admin Portal</h1>
            <p className="text-xs text-slate-400 mt-1">Enter Security PIN to manage live store inventory</p>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-3">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN (Default: 1234)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center text-sm text-white focus:outline-none focus:border-amber-400 font-mono tracking-widest"
            />
            {authError && (
              <p className="text-xs text-rose-400 font-mono">Invalid Security Key. Try "1234"</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              Unlock Dashboard →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Admin Header */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/20">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold font-display text-white">Owner & Admin Dashboard</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ⚡ Live Realtime Supabase Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Any edits to products here immediately trigger live toast and UI updates across all active visitors!
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Phone / Device</span>
        </button>
      </div>

      {/* Analytics KPIs Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">${totalRevenue.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-400 font-mono">+18.4% vs last month</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Orders</span>
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-cyan-400">{activeOrdersCount} Pending</div>
          <span className="text-[10px] text-slate-500 font-mono">Ready for fulfillment</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Inventory Units</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">{totalStockCount} Units</div>
          <span className="text-[10px] text-blue-400 font-mono">{products.length} unique catalog models</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending Trade-Ins</span>
            <Repeat className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">6 Requests</div>
          <span className="text-[10px] text-slate-500 font-mono">Awaiting inspection</span>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 font-mono text-xs">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'inventory' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Inventory ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'orders' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders Manager</span>
        </button>
        <button
          onClick={() => setActiveTab('tradeins')}
          className={`px-5 py-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'tradeins' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Trade-In Requests</span>
        </button>
        <button
          onClick={() => setActiveTab('repairs')}
          className={`px-5 py-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'repairs' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Repair Tickets</span>
        </button>
      </div>

      {/* INVENTORY CRUD TAB */}
      {activeTab === 'inventory' && (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Product List (Supabase Live Publication Active)</span>
            <span className="text-cyan-400">Changes push to connected clients instantly</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase">
                <tr>
                  <th className="p-3.5">Device</th>
                  <th className="p-3.5">Condition / Grade</th>
                  <th className="p-3.5">Live Price ($)</th>
                  <th className="p-3.5">In Stock</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img src={prod.images[0]} alt={prod.model} className="w-10 h-10 object-cover rounded-lg bg-slate-950" />
                        <div>
                          <div className="font-bold text-white">{prod.brand} {prod.model}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{prod.specs.display.split(',')[0]}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      {prod.condition === 'preowned' ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded badge-glow-preowned text-cyan-300 font-bold">
                          Pre-Owned Grade {prod.gradeIfPreowned}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded badge-glow-new text-blue-300 font-bold">
                          Brand New
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono font-bold text-cyan-400">
                      <input
                        type="number"
                        value={prod.price}
                        onChange={(e) => updateProduct(prod.id, { price: Number(e.target.value) })}
                        className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-400 focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </td>

                    <td className="p-3.5 font-mono">
                      <input
                        type="number"
                        value={prod.stock}
                        onChange={(e) => updateProduct(prod.id, { stock: Number(e.target.value) })}
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => deleteProduct(prod.id)}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                        title="Delete product live"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono text-cyan-400 font-bold">ARN-984210</span>
              <h4 className="text-sm font-bold text-white mt-0.5">iPhone 15 Pro Max (256GB / Natural Titanium)</h4>
              <p className="text-slate-400">Customer: John Doe (Shipping Express)</p>
            </div>
            <div className="text-right space-y-1">
              <span className="text-base font-bold font-mono text-white">$1,294.92</span>
              <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Shipped</div>
            </div>
          </div>
        </div>
      )}

      {/* TRADE-INS TAB */}
      {activeTab === 'tradeins' && (
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono text-amber-400 font-bold">TRD-849102</span>
              <h4 className="text-sm font-bold text-white mt-0.5">iPhone 13 (128GB)</h4>
              <p className="text-slate-400">Estimated Credit: $280 • Customer: Elena R.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">Approve $280 Payout</button>
            </div>
          </div>
        </div>
      )}

      {/* REPAIRS TAB */}
      {activeTab === 'repairs' && (
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono text-cyan-400 font-bold">REP-482910</span>
              <h4 className="text-sm font-bold text-white mt-0.5">Pixel 8 Pro • Screen Replacement</h4>
              <p className="text-slate-400">Scheduled Today at 2:00 PM</p>
            </div>
            <span className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">Stage 3: Repairing</span>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-xl space-y-4 my-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-display">Add New Smartphone / Accessory</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Brand</label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Google">Google</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="Sony">Sony</option>
                    <option value="Anker">Anker</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro Max"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Condition</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                  >
                    <option value="new">Brand New</option>
                    <option value="preowned">Certified Pre-Owned</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Grade (If Pre-Owned)</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                  >
                    <option value="A+">Grade A+ (Pristine)</option>
                    <option value="A">Grade A (Excellent)</option>
                    <option value="B">Grade B (Good)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-bold focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Badge Tagline</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. Hot Deal"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-slate-400 font-mono uppercase text-[10px]">Device Specifications</label>
                <input
                  type="text"
                  value={specDisplay}
                  onChange={(e) => setSpecDisplay(e.target.value)}
                  placeholder="Display spec..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg mt-2"
              >
                Publish Live to Store (Triggers Realtime Sync) →
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
