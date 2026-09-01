import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, CheckCircle2, MessageSquare, Wrench, ShoppingBag, Award, PlusCircle, X } from 'lucide-react';
import { Testimonial } from '../types';
import { getStoredReviews, addReview } from '../data/reviewStore';
import { getWhatsAppUrl } from '../config/business';

export const CustomerReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Testimonial[]>(getStoredReviews);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SALES' | 'SERVICES'>('ALL');

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [devicePurchased, setDevicePurchased] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setReviews(getStoredReviews());
    };
    window.addEventListener('arona_reviews_updated', handleUpdate);
    return () => window.removeEventListener('arona_reviews_updated', handleUpdate);
  }, []);

  const filteredReviews = reviews.filter(rev => {
    if (activeTab === 'SALES') return rev.devicePurchased.toLowerCase().includes('phone') || rev.devicePurchased.toLowerCase().includes('galaxy') || rev.devicePurchased.toLowerCase().includes('oneplus') || rev.devicePurchased.toLowerCase().includes('mobile');
    if (activeTab === 'SERVICES') return rev.devicePurchased.toLowerCase().includes('service') || rev.devicePurchased.toLowerCase().includes('repair') || rev.devicePurchased.toLowerCase().includes('battery') || rev.devicePurchased.toLowerCase().includes('screen');
    return true;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || !devicePurchased.trim()) {
      alert('Please fill out all required fields');
      return;
    }

    addReview({
      name: name.trim(),
      location: location.trim() || 'Tech City',
      devicePurchased: devicePurchased.trim(),
      comment: comment.trim(),
      rating
    });

    // Reset Form
    setName('');
    setLocation('');
    setDevicePurchased('');
    setComment('');
    setRating(5);
    setIsModalOpen(false);

    setSuccessMsg('Thank you! Your customer review has been published successfully.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const waReviewUrl = getWhatsAppUrl("Hi ARONA MOBILES, I read customer reviews on your website and would like to inquire about sales/service details.");

  return (
    <section id="reviews" className="py-16 bg-slate-100 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        
        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500 text-white font-semibold text-sm flex items-center justify-between shadow-lg animate-fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              {successMsg}
            </span>
            <button onClick={() => setSuccessMsg('')} className="text-white hover:text-slate-200 font-bold">✕</button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-mono font-bold uppercase">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>CUSTOMER REVIEWS & TESTIMONIALS</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-slate-900">
              TRUSTED BY 500+ CUSTOMERS FOR SALES & SERVICES
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl">
              Real feedback from customers who bought new & pre-owned smartphones or received mobile repair & trade-in services at ARONA MOBILES.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Add Review Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Write a Review</span>
            </button>

            {/* Rating Summary Badge */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 flex-shrink-0">
              <div className="text-center">
                <div className="font-heading font-black text-2xl text-slate-900 leading-none">4.9</div>
                <div className="flex text-amber-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
              <div className="border-l border-slate-200 pl-3 text-[11px]">
                <div className="font-bold text-slate-900">Google Verified Store</div>
                <div className="text-slate-500 font-mono">100% Verified Feedback</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All Customer Reviews ({reviews.length})
          </button>

          <button
            onClick={() => setActiveTab('SALES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'SALES'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Mobile Sales</span>
          </button>

          <button
            onClick={() => setActiveTab('SERVICES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'SERVICES'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Care & Repair Services</span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((review) => (
            <div 
              key={review.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Rating Stars & Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Customer
                  </span>
                </div>

                {/* Testimonial Quote */}
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>

              {/* Item Purchased / Serviced & Customer Info */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-heading font-bold text-slate-900 text-sm">{review.name}</div>
                  <div className="text-xs text-slate-500">{review.location} • <span className="font-mono text-blue-600 font-semibold">{review.devicePurchased}</span></div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">{review.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="bg-blue-600 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-left">
            <h3 className="font-heading font-black text-xl sm:text-2xl">HAZZLE-FREE PHONE SALES & REPAIR SERVICES</h3>
            <p className="text-blue-100 text-xs sm:text-sm">Visit ARONA MOBILES Bank Road store or inquire instantly on WhatsApp.</p>
          </div>

          <a
            href={waReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-full bg-white text-blue-900 hover:bg-slate-100 text-xs font-heading font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg flex-shrink-0 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

      </div>

      {/* WRITE A REVIEW MODAL POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-left animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading font-bold text-xl text-slate-900">Write a Customer Review</h3>
                <p className="text-xs text-slate-500">Share your experience with ARONA MOBILES sales or repair service</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Bank Road, Tech City"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Model or Service Received *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 16 Pro / Display Repair / Pre-Owned Phone"
                  value={devicePurchased}
                  onChange={(e) => setDevicePurchased(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-current text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Review Comment *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your feedback about product quality, price, or service speed..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20"
                >
                  Submit Review
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </section>
  );
};
