import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  PlusCircle, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Smartphone, 
  Lock, 
  Eye, 
  RefreshCw, 
  Sparkles,
  ArrowLeft,
  KeyRound,
  Send,
  CheckCircle,
  AlertCircle,
  Key
} from 'lucide-react';
import { Product, ProductCondition, UsedGrade } from '../types';
import { getStoredProducts, addProduct, deleteProduct, updateProduct, resetProductsToDefault } from '../data/productStore';

// Authorized Owner Phone Numbers
const ALLOWED_PHONE_NUMBERS = [
  '9659458606',
  '9787061617',
  '919659458606',
  '919787061617',
  '+919659458606',
  '+919787061617'
];

export const AdminPage: React.FC = () => {
  // Authentication Flow State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('arona_owner_auth') === 'true';
  });

  const [authMode, setAuthMode] = useState<'PHONE' | 'OTP' | 'PASSWORD' | 'CREATE_PASSWORD'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [authError, setAuthError] = useState('');
  const [smsBanner, setSmsBanner] = useState('');

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Upload Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState<Product['brand']>('Apple');
  const [condition, setCondition] = useState<ProductCondition>('new');
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [mrp, setMrp] = useState<string>('');
  const [storage, setStorage] = useState('128GB');
  const [ram, setRam] = useState('8GB');
  const [color, setColor] = useState('Black');
  const [warrantyInfo, setWarrantyInfo] = useState('1 Year Official Brand Warranty');
  const [batteryHealth, setBatteryHealth] = useState<number>(95);
  const [grade, setGrade] = useState<UsedGrade>('A+');
  const [boxAvailable, setBoxAvailable] = useState(true);
  const [billAvailable, setBillAvailable] = useState(true);
  const [highlightsText, setHighlightsText] = useState('100% Genuine product\nVerified hardware inspection\nReady for immediate delivery');
  
  // Image Upload State
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');

  useEffect(() => {
    setProducts(getStoredProducts());
  }, []);

  // Normalize phone number (strip spaces, hyphens, leading +)
  const cleanPhone = (num: string) => num.replace(/[\s\-\+\(\)]/g, '');

  // Mask phone number showing only first 2 and last 2 digits (e.g. +91 96XXXXXX06)
  const maskPhoneNumber = (num: string) => {
    const cleaned = num.replace(/[\s\-\+\(\)]/g, '').slice(-10);
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 2)}XXXXXX${cleaned.slice(-2)}`;
    }
    return num ? `+91 ${num}` : '';
  };

  // Step 1: Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleaned = cleanPhone(phone);
    const isAllowed = ALLOWED_PHONE_NUMBERS.some(allowed => cleanPhone(allowed) === cleaned || cleaned.endsWith(allowed.slice(-10)));

    if (!isAllowed) {
      setAuthError('Unauthorized phone number. Only registered ARONA MOBILES owner phone numbers (+91 96XXXXXX06 / +91 97XXXXXX17) can log in.');
      return;
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setSmsBanner(`📩 SMS Verification Code sent to ${maskPhoneNumber(phone)}: Your OTP is ${code}`);

    // Check if owner already created a password
    const existingPassword = localStorage.getItem('arona_owner_created_password');
    if (existingPassword) {
      setAuthMode('PASSWORD');
    } else {
      setAuthMode('OTP');
    }
  };

  // Switch to OTP login mode manually
  const handleRequestOtpMode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setSmsBanner(`📩 SMS Verification Code sent to ${maskPhoneNumber(phone)}: Your OTP is ${code}`);
    setAuthMode('OTP');
    setAuthError('');
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim() === generatedOtp) {
      setAuthError('');
      const existingPassword = localStorage.getItem('arona_owner_created_password');
      if (existingPassword) {
        completeLogin();
      } else {
        setAuthMode('CREATE_PASSWORD');
      }
    } else {
      setAuthError('Invalid OTP code. Please enter the 6-digit code shown in the notification banner.');
    }
  };

  // Step 3: Password Login
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedPassword = localStorage.getItem('arona_owner_created_password');
    if (passwordInput === savedPassword) {
      completeLogin();
    } else {
      setAuthError('Incorrect Password. You can also use OTP Login.');
    }
  };

  // Step 4: Create Owner Password
  const handleCreatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setAuthError('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    localStorage.setItem('arona_owner_created_password', newPassword);
    completeLogin();
  };

  const completeLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('arona_owner_auth', 'true');
    setAuthError('');
    setSmsBanner('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('arona_owner_auth');
    setAuthMode('PHONE');
    setPhone('');
    setOtpInput('');
    setPasswordInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrlInput('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrlInput(url);
    setImagePreview(url);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter device name');
      return;
    }
    if (!sellingPrice || isNaN(Number(sellingPrice))) {
      alert('Please enter a valid selling price');
      return;
    }

    const finalImage = imagePreview || imageUrlInput || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80';

    const newProduct: Product = {
      id: 'prod-' + Date.now(),
      name: name.trim(),
      brand,
      category: 'mobile',
      condition,
      mrp: Number(mrp) || Number(sellingPrice) * 1.15,
      sellingPrice: Number(sellingPrice),
      emiAvailable: true,
      storage,
      ram,
      color,
      images: [finalImage],
      inStock: true,
      featured: true,
      warrantyInfo: condition === 'new' ? warrantyInfo : '6 Months ARONA Care Certified Warranty',
      batteryHealth: condition === 'used' ? batteryHealth : undefined,
      grade: condition === 'used' ? grade : undefined,
      boxAvailable: condition === 'used' ? boxAvailable : true,
      billAvailable: condition === 'used' ? billAvailable : true,
      highlights: highlightsText.split('\n').filter(h => h.trim().length > 0),
      specifications: {
        screen: 'Dynamic Retina / AMOLED Display',
        processor: 'High Performance Octa-Core Chipset',
        camera: 'Pro Multi-Lens Camera System',
        battery: 'Long Lasting All-Day Battery',
        os: brand === 'Apple' ? 'iOS' : 'Android',
        network: '5G High-Speed Cellular'
      }
    };

    const updated = addProduct(newProduct);
    setProducts(updated);
    
    // Reset Form
    setName('');
    setSellingPrice('');
    setMrp('');
    setImagePreview('');
    setImageUrlInput('');
    setSuccessMsg(`"${newProduct.name}" has been uploaded successfully! Customers can now view it on the website.`);

    setTimeout(() => setSuccessMsg(''), 6000);
  };

  const handleDelete = (id: string, productName: string) => {
    if (window.confirm(`Are you sure you want to remove "${productName}" from the store catalog?`)) {
      const updated = deleteProduct(id);
      setProducts(updated);
    }
  };

  const handleToggleStock = (id: string, currentStock: boolean) => {
    const updated = updateProduct(id, { inStock: !currentStock });
    setProducts(updated);
  };

  const handleResetCatalog = () => {
    if (window.confirm('Reset catalog to sample default mobiles? This will clear custom items.')) {
      const updated = resetProductsToDefault();
      setProducts(updated);
    }
  };

  // SECURE OWNER AUTHENTICATION SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        
        {/* Top Simulated SMS Banner */}
        {smsBanner && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 max-w-lg w-full z-50 bg-emerald-500 text-white font-mono text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-400 animate-bounce">
            <span className="font-bold">{smsBanner}</span>
            <button onClick={() => setSmsBanner('')} className="text-white/80 hover:text-white font-bold ml-2">✕</button>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-white font-heading">ARONA Owner Portal</h1>
            <p className="text-slate-400 text-xs mt-1">Secure OTP & Owner Phone Login</p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* STEP 1: PHONE NUMBER INPUT */}
          {authMode === 'PHONE' && (
            <form onSubmit={handleSendOtp} className="space-y-4 text-left">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Owner Registered Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">+91</span>
                  <input
                    type="tel"
                    required
                    placeholder="Enter phone number (e.g. 96XXXXXX06)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-all"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">Registered numbers: +91 96XXXXXX06 / +91 97XXXXXX17</p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Verify Phone & Send OTP</span>
              </button>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {authMode === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 text-xs font-semibold">Enter 6-Digit OTP Code</label>
                  <span className="text-emerald-400 font-mono text-[11px]">Sent to {maskPhoneNumber(phone)}</span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="Enter OTP (e.g. 123456)"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-center font-mono text-xl tracking-widest focus:outline-none focus:border-blue-500 transition-all"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verify OTP & Log In</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('PHONE')}
                className="w-full text-slate-400 hover:text-white text-xs text-center pt-1"
              >
                ← Use a different phone number
              </button>
            </form>
          )}

          {/* STEP 3: PASSWORD LOGIN */}
          {authMode === 'PASSWORD' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Enter Owner Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-center font-mono text-base focus:outline-none focus:border-blue-500 transition-all"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Lock className="w-4 h-4" />
                <span>Log In with Password</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleRequestOtpMode}
                  className="text-blue-400 hover:underline"
                >
                  Login via OTP instead
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode('PHONE')}
                  className="text-slate-400 hover:text-white"
                >
                  Change phone
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: CREATE OWNER PASSWORD */}
          {authMode === 'CREATE_PASSWORD' && (
            <form onSubmit={handleCreatePassword} className="space-y-4 text-left">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 text-xs flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Identity Verified! Set your secure Owner Password for future logins.</span>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">New Owner Password</label>
                <input
                  type="password"
                  required
                  placeholder="Create password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <KeyRound className="w-4 h-4" />
                <span>Save Password & Open Portal</span>
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </Link>
            <span className="font-mono text-slate-500 text-[10px]">ARONA Security v2.0</span>
          </div>

        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD CONTENT
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Admin Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="font-heading font-black text-xl text-white">ARONA OWNER PORTAL</h1>
              <p className="text-slate-400 text-xs">Logged in via {maskPhoneNumber(phone || '9659458606')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              target="_blank" 
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span>View Customer Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-semibold transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        
        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 text-sm animate-fade-in text-left">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* UPLOAD FORM COLUMN */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl h-fit text-left">
            
            <div className="flex items-center gap-2 text-blue-400 font-heading font-bold text-lg border-b border-slate-800 pb-4">
              <PlusCircle className="w-5 h-5 text-blue-500" />
              <h2>Upload Mobile Photo & Details</h2>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              
              {/* Photo Upload Section */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-medium">Device Photo (Upload file or URL)</label>
                
                <div className="grid grid-cols-1 gap-3">
                  <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                    <Upload className="w-6 h-6 text-blue-400 mb-1" />
                    <span className="text-slate-300 font-semibold">Choose photo from phone / PC</span>
                    <span className="text-slate-500 text-[10px]">PNG, JPG, WEBP formats</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>

                  <div>
                    <input
                      type="url"
                      placeholder="Or paste image web link..."
                      value={imageUrlInput}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {imagePreview && (
                  <div className="mt-2 p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                    <img src={imagePreview} alt="Preview" className="w-14 h-14 object-cover rounded-lg bg-slate-900" />
                    <div className="text-slate-300">
                      <p className="font-semibold text-emerald-400 text-xs">Photo Attached</p>
                      <p className="text-[10px] text-slate-500">Ready to display to customers</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Name & Brand */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-400 mb-1">Device Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 16 Pro Max"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Brand</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value as Product['brand'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="Vivo">Vivo</option>
                    <option value="OPPO">OPPO</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Realme">Realme</option>
                    <option value="Motorola">Motorola</option>
                    <option value="Google">Google</option>
                  </select>
                </div>
              </div>

              {/* Condition Toggle */}
              <div>
                <label className="block text-slate-400 mb-1">Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCondition('new')}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      condition === 'new'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    ✨ Brand New
                  </button>
                  <button
                    type="button"
                    onClick={() => setCondition('used')}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      condition === 'used'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    Certified Pre-Owned
                  </button>
                </div>
              </div>

              {/* Price Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 54900"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-emerald-400 font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 64900"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Storage & RAM & Color */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Storage</label>
                  <input
                    type="text"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">RAM</label>
                  <input
                    type="text"
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Color</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Pre-Owned Extra Fields */}
              {condition === 'used' && (
                <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-2xl space-y-3">
                  <div className="font-semibold text-purple-300 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Pre-Owned Device Inspection</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Battery Health %</label>
                      <input
                        type="number"
                        min="70"
                        max="100"
                        value={batteryHealth}
                        onChange={(e) => setBatteryHealth(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-emerald-400 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Condition Grade</label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value as UsedGrade)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                      >
                        <option value="A+">Grade A+ (Pristine)</option>
                        <option value="A">Grade A (Very Good)</option>
                        <option value="B">Grade B (Good Value)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-300 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={boxAvailable} 
                        onChange={(e) => setBoxAvailable(e.target.checked)} 
                        className="rounded accent-purple-600"
                      />
                      <span>Original Box</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={billAvailable} 
                        onChange={(e) => setBillAvailable(e.target.checked)} 
                        className="rounded accent-purple-600"
                      />
                      <span>Original Bill</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Publish Mobile to Store</span>
              </button>

            </form>
          </div>

          {/* INVENTORY LIST COLUMN */}
          <div className="lg:col-span-7 space-y-4 text-left">
            
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div>
                <h3 className="font-heading font-bold text-white text-base">Active Store Catalog</h3>
                <p className="text-slate-400 text-xs">{products.length} Mobiles listed for customers</p>
              </div>

              <button
                onClick={handleResetCatalog}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition-all"
                title="Reset to default sample mobiles"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Catalog</span>
              </button>
            </div>

            {/* Inventory List */}
            <div className="space-y-3">
              {products.map((prod) => (
                <div 
                  key={prod.id} 
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={prod.images[0]} 
                      alt={prod.name} 
                      className="w-14 h-14 object-cover rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0" 
                    />
                    
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{prod.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          prod.condition === 'new' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {prod.condition === 'new' ? 'New' : `Used (${prod.batteryHealth}% Batt)`}
                        </span>
                      </div>

                      <div className="text-slate-400 text-xs">
                        {prod.brand} • {prod.storage} • {prod.color}
                      </div>

                      <div className="font-bold text-emerald-400 text-xs">
                        ₹{prod.sellingPrice.toLocaleString('en-IN')} <span className="text-slate-500 line-through text-[10px]">₹{prod.mrp.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStock(prod.id, prod.inStock)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        prod.inStock 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white' 
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white'
                      }`}
                    >
                      {prod.inStock ? 'In Stock' : 'Out of Stock'}
                    </button>

                    <button
                      onClick={() => handleDelete(prod.id, prod.name)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};
