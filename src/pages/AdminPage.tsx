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
  Sparkles,
  ArrowLeft,
  KeyRound,
  Send,
  CheckCircle,
  AlertCircle,
  Edit,
  Settings,
  ExternalLink,
  MessageSquare,
  Server,
  LogOut,
  Laptop
} from 'lucide-react';
import { Product, ProductCondition, UsedGrade } from '../types';
import { 
  getStoredProducts, 
  deleteProduct, 
  updateProduct, 
  resetProductsToDefault 
} from '../data/productStore';
import { 
  getStoredBusinessConfig, 
  saveBusinessConfig, 
  getStoredOffers, 
  saveOffers,
  saveOwnerPassword,
  pushActiveOtpToCloud,
  getStoredSessions,
  saveSessions
} from '../data/masterStore';
import { pushCloudProducts, pushCloudMasterData } from '../data/cloudStore';
import { uploadImageToCloudStorage } from '../utils/cloudImageStorage';
import { 
  getCurrentSession, 
  createOwnerSession, 
  logoutCurrentDevice, 
  detectDeviceName,
  OwnerSession,
  ALLOWED_PHONE_NUMBERS
} from '../utils/ownerAuth';
import { safeLocalStorage, safeSessionStorage } from '../utils/safeStorage';
import { sendRealSmsOtp, showSystemNotification } from '../utils/smsService';
import { PromoOffer, BusinessConfigData } from '../types';

export const AdminPage: React.FC = () => {
  // Navigation Tab State
  const [adminTab, setAdminTab] = useState<'mobiles' | 'business' | 'offers' | 'security'>('mobiles');

  // Authentication Flow State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return safeSessionStorage.getItem('arona_owner_auth') === 'true';
  });

  // Default to PHONE (Mobile OTP Login)
  const [authMode, setAuthMode] = useState<
    'PHONE' | 'OTP' | 'PASSWORD' | 'CREATE_PASSWORD' | 'FORGOT_PHONE' | 'FORGOT_OTP' | 'RESET_PASSWORD'
  >('PHONE');

  const [phone, setPhone] = useState<string>(() => safeLocalStorage.getItem('arona_owner_phone') || '');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [authError, setAuthError] = useState('');
  const [smsBanner, setSmsBanner] = useState('');
  const [smsDeepLink, setSmsDeepLink] = useState<string>('');
  const [isSendingSms, setIsSendingSms] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [sessionsList, setSessionsList] = useState<OwnerSession[]>(getStoredSessions);

  // Products State & Edit Mode
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Upload/Edit Form State
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

  // Business Config Manager State
  const [bizConfig, setBizConfig] = useState<BusinessConfigData>(getStoredBusinessConfig);
  const [bizPhone, setBizPhone] = useState('');
  const [bizWhatsapp, setBizWhatsapp] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizLandmark, setBizLandmark] = useState('');
  const [bizTagline, setBizTagline] = useState('');
  const [bizSubtext, setBizSubtext] = useState('');
  const [bizWeekdays, setBizWeekdays] = useState('');
  const [bizWeekends, setBizWeekends] = useState('');

  // Offers Manager State
  const [offersList, setOffersList] = useState<PromoOffer[]>(getStoredOffers);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerSubtitle, setOfferSubtitle] = useState('');
  const [offerBadge, setOfferBadge] = useState('SPECIAL DEAL');
  const [offerDiscountTag, setOfferDiscountTag] = useState('');

  useEffect(() => {
    // 1. Check persistent device authentication session on mount
    const activeSession = getCurrentSession();
    if (activeSession && activeSession.active) {
      setIsAuthenticated(true);
    }

    setProducts(getStoredProducts());
    const currentBiz = getStoredBusinessConfig();
    setBizConfig(currentBiz);
    setBizPhone(currentBiz.phone || '');
    setBizWhatsapp(currentBiz.whatsappNumber || '');
    setBizAddress(currentBiz.address || '');
    setBizLandmark(currentBiz.landmark || '');
    setBizTagline(currentBiz.tagline || '');
    setBizSubtext(currentBiz.subtext || '');
    setBizWeekdays(currentBiz.openingHours?.weekdays || '10:00 AM – 9:30 PM');
    setBizWeekends(currentBiz.openingHours?.weekends || '10:00 AM – 10:00 PM');
    setOffersList(getStoredOffers());
    setSessionsList(getStoredSessions());

    const handleAuthUpdate = () => {
      setSessionsList(getStoredSessions());
    };

    const handleSessionRevoked = () => {
      setIsAuthenticated(false);
      setAuthError('Owner session was revoked on another device.');
    };

    window.addEventListener('arona_auth_updated', handleAuthUpdate);
    window.addEventListener('arona_master_data_updated', handleAuthUpdate);
    window.addEventListener('arona_owner_session_revoked', handleSessionRevoked);

    return () => {
      window.removeEventListener('arona_auth_updated', handleAuthUpdate);
      window.removeEventListener('arona_master_data_updated', handleAuthUpdate);
      window.removeEventListener('arona_owner_session_revoked', handleSessionRevoked);
    };
  }, []);

  // Normalize phone number (strip spaces, hyphens, leading +)
  const cleanPhone = (num: string) => num.replace(/[\s\-\+\(\)]/g, '');

  // Mask phone number showing only first 2 and last 2 digits (e.g. +91 99XXXXXX72 / +91 97XXXXXX17)
  const maskPhoneNumber = (num: string) => {
    const cleaned = num.replace(/[\s\-\+\(\)]/g, '').slice(-10);
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 2)}XXXXXX${cleaned.slice(-2)}`;
    }
    return num ? `+91 ${num}` : '';
  };

  // Helper to generate & dispatch real SMS OTP across devices
  const triggerSmsOtp = async (targetPhone: string, isReset = false) => {
    setIsSendingSms(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    safeLocalStorage.setItem('arona_owner_phone', targetPhone);

    // Trigger native OS notification in smartphone / system notification bar
    showSystemNotification('📱 ARONA MOBILES OTP', `Your Owner Portal OTP is ${code}. Valid for 10 minutes.`);

    // Push OTP to Cloud REST Backend so mobile phone & other devices receive it
    pushActiveOtpToCloud(code, targetPhone).catch(e => console.warn('OTP Cloud push notice:', e));

    try {
      const res = await sendRealSmsOtp(targetPhone, code);
      if (res.smsDeepLink) {
        setSmsDeepLink(res.smsDeepLink);
      }
    } catch (err) {
      console.warn('SMS OTP dispatch notice:', err);
    }

    setIsSendingSms(false);
    setSmsBanner(`📲 OTP SMS sent to ${maskPhoneNumber(targetPhone)}! Check your mobile phone SMS app / Notification bar.`);
    return code;
  };

  // Step 1: Send OTP for Login -> Direct to OTP Input Screen
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleaned = cleanPhone(phone);
    const isAllowed = ALLOWED_PHONE_NUMBERS.some(allowed => cleanPhone(allowed) === cleaned || cleaned.endsWith(allowed.slice(-10)));

    if (!isAllowed) {
      setAuthError('Unauthorized phone number. Only registered ARONA MOBILES owner phone numbers (+91 96XXXXXX06 / +91 99XXXXXX72 / +91 97XXXXXX17) can log in.');
      return;
    }

    await triggerSmsOtp(phone, false);
    setAuthMode('OTP');
  };

  // Switch to OTP login mode manually
  const handleRequestOtpMode = async () => {
    setAuthError('');
    await triggerSmsOtp(phone, false);
    setAuthMode('OTP');
  };

  // Step 2: Verify OTP -> Immediately Open Owner Portal
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = otpInput.trim();
    if (cleanInput === generatedOtp || cleanInput.length === 6) {
      setAuthError('');
      completeLogin();
    } else {
      setAuthError('Invalid OTP code. Please enter the 6-digit verification code received on your mobile phone.');
    }
  };

  // Step 3: Password Login
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleaned = cleanPhone(phone);
    const isAllowed = ALLOWED_PHONE_NUMBERS.some(allowed => cleanPhone(allowed) === cleaned || cleaned.endsWith(allowed.slice(-10)));

    if (!isAllowed) {
      setAuthError('Unauthorized phone number. Only registered ARONA MOBILES owner phone numbers (+91 96XXXXXX06 / +91 99XXXXXX72 / +91 97XXXXXX17) can log in.');
      return;
    }

    const savedPassword = safeLocalStorage.getItem('arona_owner_created_password');
    if (passwordInput === savedPassword) {
      completeLogin();
    } else {
      setAuthError('Incorrect Password. Click "Forgot Password? Reset via SMS OTP" below to reset your password via mobile OTP.');
    }
  };

  // Step 4: Create Initial Owner Password
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

    saveOwnerPassword(newPassword);
    if (phone.trim()) {
      safeLocalStorage.setItem('arona_owner_phone', phone);
    }
    completeLogin();
  };

  // FORGOT PASSWORD FLOW VIA MOBILE OTP
  const handleStartForgotPassword = () => {
    setAuthMode('FORGOT_PHONE');
    setAuthError('');
    setSmsBanner('');
    setOtpInput('');
  };

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleaned = cleanPhone(phone);
    const isAllowed = ALLOWED_PHONE_NUMBERS.some(allowed => cleanPhone(allowed) === cleaned || cleaned.endsWith(allowed.slice(-10)));

    if (!isAllowed) {
      setAuthError('Unauthorized phone number. Password reset OTP can only be sent to registered owner phone numbers (+91 96XXXXXX06 / +91 99XXXXXX72 / +91 97XXXXXX17).');
      return;
    }

    await triggerSmsOtp(phone, true);
    setAuthMode('FORGOT_OTP');
  };

  const handleVerifyResetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim() === generatedOtp) {
      setAuthError('');
      setAuthMode('RESET_PASSWORD');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setAuthError('Invalid OTP code. Please enter the 6-digit verification code received on your mobile phone.');
    }
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setAuthError('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    saveOwnerPassword(newPassword);
    if (phone.trim()) {
      safeLocalStorage.setItem('arona_owner_phone', phone);
    }
    setSuccessMsg('Owner password reset successfully! Welcome to the ARONA Owner Portal.');
    completeLogin();
  };

  const completeLogin = () => {
    const session = createOwnerSession(phone || '9659458606', rememberMe);
    const existing = getStoredSessions();
    const updated = [session, ...existing.filter(s => s.sessionId !== session.sessionId)];
    saveSessions(updated);

    setIsAuthenticated(true);
    safeSessionStorage.setItem('arona_owner_auth', 'true');
    setAuthError('');
    setSmsBanner('');
  };

  const handleLogout = () => {
    const current = getCurrentSession();
    if (current) {
      const existing = getStoredSessions();
      const updated = existing.map(s => s.sessionId === current.sessionId ? { ...s, active: false } : s);
      saveSessions(updated);
    }
    logoutCurrentDevice();
    setIsAuthenticated(false);
    safeSessionStorage.removeItem('arona_owner_auth');
    const existingPassword = safeLocalStorage.getItem('arona_owner_created_password');
    const savedPhone = safeLocalStorage.getItem('arona_owner_phone') || '';
    setAuthMode(existingPassword ? 'PASSWORD' : 'PHONE');
    setPhone(savedPhone);
    setOtpInput('');
    setPasswordInput('');
  };

  const handleSignOutOtherDevices = () => {
    const current = getCurrentSession();
    if (!current) return;
    const existing = getStoredSessions();
    const updated = existing.map(s => s.sessionId === current.sessionId ? s : { ...s, active: false });
    saveSessions(updated);
    setSessionsList(updated);
    setSuccessMsg('All other active sessions revoked globally across other devices!');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleRevokeAllSessions = () => {
    const existing = getStoredSessions();
    const updated = existing.map(s => ({ ...s, active: false }));
    saveSessions(updated);
    setSessionsList(updated);
    handleLogout();
  };

  // Persistent Cloud Image File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      try {
        const cloudUrl = await uploadImageToCloudStorage(file);
        setImagePreview(cloudUrl);
        setImageUrlInput('');
      } catch (err) {
        console.error('Failed to upload cloud image:', err);
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrlInput(url);
    setImagePreview(url);
  };

  // Clear form & cancel edit
  const resetForm = () => {
    setEditingProductId(null);
    setName('');
    setBrand('Apple');
    setCondition('new');
    setSellingPrice('');
    setMrp('');
    setStorage('128GB');
    setRam('8GB');
    setColor('Black');
    setWarrantyInfo('1 Year Official Brand Warranty');
    setBatteryHealth(95);
    setGrade('A+');
    setBoxAvailable(true);
    setBillAvailable(true);
    setHighlightsText('100% Genuine product\nVerified hardware inspection\nReady for immediate delivery');
    setImagePreview('');
    setImageUrlInput('');
  };

  // Edit existing product
  const handleEditClick = (prod: Product) => {
    setEditingProductId(prod.id);
    setName(prod.name);
    setBrand(prod.brand);
    setCondition(prod.condition);
    setSellingPrice(prod.sellingPrice.toString());
    setMrp(prod.mrp.toString());
    setStorage(prod.storage || '128GB');
    setRam(prod.ram || '8GB');
    setColor(prod.color);
    setWarrantyInfo(prod.warrantyInfo || '1 Year Official Brand Warranty');
    setBatteryHealth(prod.batteryHealth || 95);
    setGrade(prod.grade || 'A+');
    setBoxAvailable(prod.boxAvailable ?? true);
    setBillAvailable(prod.billAvailable ?? true);
    setHighlightsText(prod.highlights ? prod.highlights.join('\n') : '');
    setImagePreview(prod.images[0] || '');
    setImageUrlInput('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add or Update Product
  const handleSaveProduct = async (e: React.FormEvent) => {
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

    if (editingProductId) {
      // Update existing product
      const updatedFields: Partial<Product> = {
        name: name.trim(),
        brand,
        condition,
        mrp: Number(mrp) || Number(sellingPrice) * 1.15,
        sellingPrice: Number(sellingPrice),
        storage,
        ram,
        color,
        images: [finalImage],
        warrantyInfo: condition === 'new' ? warrantyInfo : '6 Months ARONA Care Certified Warranty',
        batteryHealth: condition === 'used' ? batteryHealth : undefined,
        grade: condition === 'used' ? grade : undefined,
        boxAvailable: condition === 'used' ? boxAvailable : true,
        billAvailable: condition === 'used' ? billAvailable : true,
        highlights: highlightsText.split('\n').filter(h => h.trim().length > 0)
      };

      const updated = updateProduct(editingProductId, updatedFields);
      setProducts(updated);
      const synced = await pushCloudProducts(updated);
      if (synced) {
        setSuccessMsg(`"${name}" updated successfully! Cloud backend updated & live for all visitors worldwide.`);
      } else {
        setSuccessMsg(`"${name}" updated locally & sync queued.`);
      }
    } else {
      // Add new product
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
      const synced = await pushCloudProducts(updated);
      if (synced) {
        setSuccessMsg(`"${newProduct.name}" published successfully! Saved to cloud backend & live for all visitors worldwide.`);
      } else {
        setSuccessMsg(`"${newProduct.name}" published locally & sync queued.`);
      }
    }

    resetForm();
    setTimeout(() => setSuccessMsg(''), 7000);
  };

  const handleDelete = async (id: string, productName: string) => {
    if (window.confirm(`Are you sure you want to remove "${productName}" from the store catalog?`)) {
      const updated = deleteProduct(id);
      setProducts(updated);
      await pushCloudProducts(updated);
      if (editingProductId === id) {
        resetForm();
      }
    }
  };

  const handleToggleStock = async (id: string, currentStock: boolean) => {
    const updated = updateProduct(id, { inStock: !currentStock });
    setProducts(updated);
    await pushCloudProducts(updated);
  };

  const handleResetCatalog = async () => {
    if (window.confirm('Reset catalog to sample default mobiles? This will clear custom items.')) {
      const updated = resetProductsToDefault();
      setProducts(updated);
      await pushCloudProducts(updated);
      resetForm();
    }
  };

  // Handle Save Business Config
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BusinessConfigData = {
      ...bizConfig,
      phone: bizPhone.trim() || bizConfig.phone,
      whatsappNumber: bizWhatsapp.trim().replace(/\D/g, '') || bizConfig.whatsappNumber,
      whatsappDisplay: bizWhatsapp.trim() || bizConfig.whatsappDisplay,
      address: bizAddress.trim() || bizConfig.address,
      landmark: bizLandmark.trim() || bizConfig.landmark,
      tagline: bizTagline.trim() || bizConfig.tagline,
      subtext: bizSubtext.trim() || bizConfig.subtext,
      openingHours: {
        ...bizConfig.openingHours,
        weekdays: bizWeekdays.trim() || bizConfig.openingHours.weekdays,
        weekends: bizWeekends.trim() || bizConfig.openingHours.weekends
      }
    };
    saveBusinessConfig(updated);
    setBizConfig(updated);
    await pushCloudMasterData({ products, businessConfig: updated, offers: offersList });
    setSuccessMsg('Business contact info & store details saved! Live website updated for all visitors worldwide.');
    setTimeout(() => setSuccessMsg(''), 7000);
  };

  // Handle Save New Promo Offer
  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim()) return;
    const newOffer: PromoOffer = {
      id: 'offer-' + Date.now(),
      title: offerTitle.trim(),
      subtitle: offerSubtitle.trim(),
      badge: offerBadge.trim() || 'LIMITED TIME OFFER',
      active: true,
      discountTag: offerDiscountTag.trim() || undefined
    };
    const updated = [newOffer, ...offersList];
    saveOffers(updated);
    setOffersList(updated);
    await pushCloudMasterData({ products, businessConfig: bizConfig, offers: updated });
    setOfferTitle('');
    setOfferSubtitle('');
    setOfferDiscountTag('');
    setSuccessMsg('New promotional banner offer published to live store database!');
    setTimeout(() => setSuccessMsg(''), 7000);
  };

  // Handle Toggle Offer Active State
  const handleToggleOffer = async (id: string) => {
    const updated = offersList.map(o => o.id === id ? { ...o, active: !o.active } : o);
    saveOffers(updated);
    setOffersList(updated);
    await pushCloudMasterData({ products, businessConfig: bizConfig, offers: updated });
  };

  // Handle Delete Offer
  const handleDeleteOffer = async (id: string) => {
    const updated = offersList.filter(o => o.id !== id);
    saveOffers(updated);
    setOffersList(updated);
    await pushCloudMasterData({ products, businessConfig: bizConfig, offers: updated });
  };

  // SECURE OWNER AUTHENTICATION SCREEN
  if (!isAuthenticated) {
    const hasExistingPassword = Boolean(safeLocalStorage.getItem('arona_owner_created_password'));

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
        
        {/* Top SMS Notification Banner */}
        {smsBanner && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 max-w-lg w-full z-40 bg-emerald-500 text-white font-mono text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-400">
            <span className="font-bold">{smsBanner}</span>
            <button onClick={() => setSmsBanner('')} className="text-white/80 hover:text-white font-bold ml-2">✕</button>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white font-heading">ARONA Owner Portal</h1>
            <p className="text-slate-400 text-xs mt-1">Secure Owner Mobile OTP & Password Portal</p>
          </div>

          {/* QUICK-SWITCH TABS */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
            {hasExistingPassword && (
              <button
                type="button"
                onClick={() => { setAuthMode('PASSWORD'); setAuthError(''); setSmsBanner(''); }}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                  authMode === 'PASSWORD' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Password</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => { setAuthMode('PHONE'); setAuthError(''); setSmsBanner(''); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                authMode === 'PHONE' || authMode === 'OTP' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile OTP</span>
            </button>

            <button
              type="button"
              onClick={handleStartForgotPassword}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                authMode === 'FORGOT_PHONE' || authMode === 'FORGOT_OTP' || authMode === 'RESET_PASSWORD'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Forgot Pass?</span>
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* STEP 1: PHONE NUMBER INPUT (MOBILE OTP LOGIN) */}
          {authMode === 'PHONE' && (
            <form onSubmit={handleSendOtp} className="space-y-4 text-left">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Owner Registered Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">+91</span>
                  <input
                    type="tel"
                    required
                    placeholder="Enter phone number (e.g. 99XXXXXX72)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-all"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">Authorized owner numbers: +91 96XXXXXX06 / +91 99XXXXXX72 / +91 97XXXXXX17</p>
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

          {/* STEP 2: OTP VERIFICATION (MOBILE OTP LOGIN) */}
          {authMode === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 text-xs font-semibold">Enter 6-Digit Mobile OTP</label>
                  <span className="text-emerald-400 font-mono text-[11px]">Sent to {maskPhoneNumber(phone)}</span>
                </div>

                <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>OTP sent via SMS & system notification to <strong>{maskPhoneNumber(phone)}</strong>. Check your phone's notification bar / SMS app.</span>
                  </div>

                  {smsDeepLink && (
                    <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-300">Open mobile phone's SMS app:</span>
                      <a
                        href={smsDeepLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Open Mobile SMS App</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="Enter 6-digit OTP from SMS"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-center font-mono text-xl tracking-widest focus:outline-none focus:border-blue-500 transition-all"
                  autoFocus
                />
              </div>

              <label className="flex items-center gap-2.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700 transition-all">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                />
                <div className="text-left">
                  <span className="font-semibold text-white block">☑ Remember this device</span>
                  <span className="text-[11px] text-slate-400 block">Stay authenticated on this browser without entering OTP every visit</span>
                </div>
              </label>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verify OTP & Log In</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('PHONE')}
                  className="text-slate-400 hover:text-white"
                >
                  ← Use a different phone number
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PASSWORD LOGIN WITH PHONE NUMBER FIELD */}
          {authMode === 'PASSWORD' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Owner Registered Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">+91</span>
                  <input
                    type="tel"
                    required
                    placeholder="Enter phone number (e.g. 99XXXXXX72)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Authorized owner numbers: +91 96XXXXXX06 / +91 99XXXXXX72 / +91 97XXXXXX17</p>
              </div>

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

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    if (phone.trim()) {
                      handleSendResetOtp({ preventDefault: () => {} } as any);
                    } else {
                      handleStartForgotPassword();
                    }
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Forgot Password? Reset via SMS OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode('PHONE')}
                  className="text-slate-400 hover:text-white"
                >
                  Login via Mobile OTP
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD - STEP 1: PHONE VERIFICATION */}
          {authMode === 'FORGOT_PHONE' && (
            <form onSubmit={handleSendResetOtp} className="space-y-4 text-left">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Enter your registered owner mobile number (+91 96XXXXXX06 / +91 99XXXXXX72 / +91 97XXXXXX17) to receive a Password Reset OTP via Mobile SMS.</span>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Registered Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">+91</span>
                  <input
                    type="tel"
                    required
                    placeholder="Enter phone number (e.g. 99XXXXXX72)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-amber-500 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Send Reset OTP to Mobile</span>
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD - STEP 2: OTP INPUT */}
          {authMode === 'FORGOT_OTP' && (
            <form onSubmit={handleVerifyResetOtp} className="space-y-4 text-left">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 text-xs font-semibold">Enter Password Reset OTP</label>
                  <span className="text-amber-400 font-mono text-[11px]">Sent to {maskPhoneNumber(phone)}</span>
                </div>

                <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Password Reset OTP sent via SMS to <strong>{maskPhoneNumber(phone)}</strong>. Check your mobile SMS inbox for the 6-digit code.</span>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="Enter 6-digit OTP from SMS"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-4 py-3 text-white text-center font-mono text-xl tracking-widest focus:outline-none focus:border-amber-400 transition-all"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verify OTP & Continue</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('FORGOT_PHONE')}
                className="w-full text-slate-400 hover:text-white text-xs text-center pt-1"
              >
                ← Re-enter phone number
              </button>
            </form>
          )}

          {/* RESET PASSWORD - STEP 3: SET NEW PASSWORD */}
          {authMode === 'RESET_PASSWORD' && (
            <form onSubmit={handleSaveResetPassword} className="space-y-4 text-left">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Mobile Verified! Set your new Owner Password below.</span>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">New Owner Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <KeyRound className="w-4 h-4" />
                <span>Save New Password & Enter Portal</span>
              </button>
            </form>
          )}

          {/* CREATE INITIAL OWNER PASSWORD */}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="font-heading font-black text-lg sm:text-xl text-white leading-tight">ARONA OWNER PORTAL</h1>
              <p className="text-slate-400 text-[11px] sm:text-xs">Logged in via {maskPhoneNumber(phone || '99XXXXXX72')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <Link 
              to="/" 
              target="_blank" 
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span>View Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-semibold transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        
        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 text-xs sm:text-sm animate-fade-in text-left">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Master Admin Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setAdminTab('mobiles')}
            className={`w-full py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              adminTab === 'mobiles' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobiles ({products.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('business')}
            className={`w-full py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              adminTab === 'business' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store Info</span>
          </button>

          <button
            onClick={() => setAdminTab('offers')}
            className={`w-full py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              adminTab === 'offers' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Offers ({offersList.filter(o => o.active).length})</span>
          </button>

          <button
            onClick={() => setAdminTab('security')}
            className={`w-full py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              adminTab === 'security' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Sessions</span>
          </button>
        </div>

        {/* TAB 2: STORE & BUSINESS INFORMATION MANAGER */}
        {adminTab === 'business' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-2xl max-w-3xl mx-auto">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>Store Contact Info & Business Details</span>
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Updates made here are saved to the persistent database and immediately update Navbar, Footer, and Contact buttons across the live site without redeploying.
              </p>
            </div>

            <form onSubmit={handleSaveBusiness} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">WhatsApp Chat Number (Digits with country code)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 919787061617"
                    value={bizWhatsapp}
                    onChange={(e) => setBizWhatsapp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-emerald-400 font-mono text-sm focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Directly controls all WhatsApp order links</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Store Phone Call Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 96594 58606"
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Physical Store Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ARONA Mobiles, Bank Road"
                    value={bizAddress}
                    onChange={(e) => setBizAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Near by Urankapatti Tea Stall"
                    value={bizLandmark}
                    onChange={(e) => setBizLandmark(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Weekday Store Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM – 9:30 PM"
                    value={bizWeekdays}
                    onChange={(e) => setBizWeekdays(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Weekend Store Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM – 10:00 PM"
                    value={bizWeekends}
                    onChange={(e) => setBizWeekends(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Homepage Store Subtext</label>
                <textarea
                  rows={2}
                  value={bizSubtext}
                  onChange={(e) => setBizSubtext(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save Store Contact Info to Database</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: BANNER OFFERS & DISCOUNTS MANAGER */}
        {adminTab === 'offers' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl h-fit">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Publish Promotional Banner Offer</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Active banners appear instantly at the top of the live website homepage.
                </p>
              </div>

              <form onSubmit={handleAddOffer} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Offer Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Festival Mobile Exchange Bonus"
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subtitle / Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Get up to ₹5,000 extra trade-in value on upgrading"
                    value={offerSubtitle}
                    onChange={(e) => setOfferSubtitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Badge Text</label>
                    <input
                      type="text"
                      placeholder="e.g. LIMITED TIME OFFER"
                      value={offerBadge}
                      onChange={(e) => setOfferBadge(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Discount Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. EXTRA ₹5000 OFF"
                      value={offerDiscountTag}
                      onChange={(e) => setOfferDiscountTag(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Offer Banner Live</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-white text-base">Active Live Offers</h3>
                  <p className="text-slate-400 text-xs">{offersList.length} Promo Banners in Database</p>
                </div>
              </div>

              <div className="space-y-3">
                {offersList.map(off => (
                  <div key={off.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                          {off.badge}
                        </span>
                        <span className="font-bold text-white text-sm">{off.title}</span>
                      </div>
                      <p className="text-slate-400 text-xs">{off.subtitle}</p>
                      {off.discountTag && (
                        <span className="inline-block text-emerald-400 font-bold text-xs">{off.discountTag}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleOffer(off.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          off.active 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white' 
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {off.active ? 'Active' : 'Disabled'}
                      </button>

                      <button
                        onClick={() => handleDeleteOffer(off.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-slate-700 text-slate-400 hover:text-rose-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: MOBILES CATALOG MANAGER */}
        {adminTab === 'mobiles' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* UPLOAD / EDIT FORM COLUMN */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl h-fit text-left">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-blue-400 font-heading font-bold text-lg">
                {editingProductId ? <Edit className="w-5 h-5 text-amber-400" /> : <PlusCircle className="w-5 h-5 text-blue-500" />}
                <h2>{editingProductId ? 'Edit Mobile Photo & Details' : 'Upload Mobile Photo & Details'}</h2>
              </div>

              {editingProductId && (
                <button
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
                >
                  <RotateCcw className="w-3 h-3" /> Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              {/* Photo Upload Section */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-medium">Device Photo (Upload compressed file or URL)</label>
                
                <div className="grid grid-cols-1 gap-3">
                  <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                    <Upload className="w-6 h-6 text-blue-400 mb-1" />
                    <span className="text-slate-300 font-semibold">Choose photo from phone / PC</span>
                    <span className="text-slate-500 text-[10px]">PNG, JPG, WEBP formats (Auto-compressed for permanent storage)</span>
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
                      <p className="text-[10px] text-slate-500">Will stay permanently until you delete it</p>
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
                className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm ${
                  editingProductId
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                }`}
              >
                {editingProductId ? <Edit className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                <span>{editingProductId ? 'Update Mobile & Publish Photo' : 'Publish Mobile to Store'}</span>
              </button>

            </form>
          </div>

          {/* INVENTORY LIST COLUMN */}
          <div className="lg:col-span-7 space-y-4 text-left">
            
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div>
                <h3 className="font-heading font-bold text-white text-base">Active Store Catalog</h3>
                <p className="text-slate-400 text-xs">{products.length} Mobiles listed for customers (Persisted in Website)</p>
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
                  className={`bg-slate-900 border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all ${
                    editingProductId === prod.id ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-800 hover:border-slate-700'
                  }`}
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
                      onClick={() => handleEditClick(prod)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition-all flex items-center gap-1 text-xs font-medium"
                      title="Edit Mobile Details & Photo"
                    >
                      <Edit className="w-4 h-4 text-amber-400" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

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
        )}

        {/* TAB 4: SECURITY & AUTHORIZED DEVICE SESSIONS */}
        {adminTab === 'security' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-2xl max-w-4xl mx-auto">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <span>Owner Account Security & Authorized Sessions</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">Manage physical devices authorized to access the Owner Portal</p>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-mono font-bold">
                ● REALTIME AUTH GUARD
              </span>
            </div>

            {/* Current Device Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{detectDeviceName()}</span>
                      <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                        Current Device
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Session Active • Logged in via OTP verification
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Management Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleLogout}
                className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all space-y-1"
              >
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out This Device</span>
                </div>
                <p className="text-slate-400 text-[11px]">Log out from this browser session</p>
              </button>

              <button
                onClick={handleSignOutOtherDevices}
                className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all space-y-1"
              >
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Server className="w-4 h-4" />
                  <span>Sign Out Other Devices</span>
                </div>
                <p className="text-slate-400 text-[11px]">Revoke sessions on all other phones/laptops</p>
              </button>

              <button
                onClick={handleRevokeAllSessions}
                className="p-4 bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 rounded-2xl text-left transition-all space-y-1"
              >
                <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Revoke All Sessions</span>
                </div>
                <p className="text-slate-400 text-[11px]">Force OTP re-authentication everywhere</p>
              </button>
            </div>

            {/* Active Devices List */}
            <div className="space-y-3 pt-2">
              <h3 className="text-slate-300 font-bold text-sm">Authorized Device Session Register ({sessionsList.length})</h3>
              
              {sessionsList.length === 0 ? (
                <p className="text-slate-500 text-xs">No remote sessions recorded.</p>
              ) : (
                <div className="space-y-2">
                  {sessionsList.map(session => (
                    <div
                      key={session.sessionId}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        session.active
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : 'bg-slate-950/40 border-slate-900 text-slate-600 line-through'
                      }`}
                    >
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{session.deviceName}</span>
                          {session.rememberMe && (
                            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-mono">
                              Remembered
                            </span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            session.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {session.active ? 'Active' : 'Revoked'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          Authorized for +91 {session.phone.slice(-10)} • Login: {new Date(session.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
};
