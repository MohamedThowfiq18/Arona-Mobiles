import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Product } from './types';
import { getStoredProducts } from './data/productStore';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';

import { HomePage } from './pages/HomePage';
import { NewMobilesPage } from './pages/NewMobilesPage';
import { PreOwnedPage } from './pages/PreOwnedPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ExchangePage } from './pages/ExchangePage';
import { AccessoriesPage } from './pages/AccessoriesPage';
import { ServicesPage } from './pages/ServicesPage';
import { StorePage } from './pages/StorePage';
import { AdminPage } from './pages/AdminPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainLayout({ products, onSearchOpen }: { products: Product[], onSearchOpen: () => void }) {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  if (isAdmin) {
    return <AdminPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-body relative overflow-x-hidden flex flex-col justify-between pb-16 lg:pb-0">
      <Navbar onSearchOpen={onSearchOpen} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new-mobiles" element={<NewMobilesPage />} />
          <Route path="/pre-owned" element={<PreOwnedPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/exchange" element={<ExchangePage />} />
          <Route path="/accessories" element={<AccessoriesPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(getStoredProducts);

  useEffect(() => {
    const handleUpdate = () => {
      setProducts(getStoredProducts());
    };
    window.addEventListener('arona_products_updated', handleUpdate);
    return () => window.removeEventListener('arona_products_updated', handleUpdate);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route 
          path="/*" 
          element={
            <>
              <MainLayout products={products} onSearchOpen={() => setIsSearchOpen(true)} />
              <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                products={products}
                onSelectProduct={(p) => {
                  window.location.href = `/product/${p.id}`;
                }}
              />
              <WhatsAppFloatingButton />
            </>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
