'use client';

import React from 'react';
import { X, Trash2, Check, Smartphone, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCompareStore } from '@/store/useCompareStore';
import { useCartStore } from '@/store/useCartStore';

export function CompareModal() {
  const { items, isOpen, closeCompareModal, removeCompare, clearCompare } = useCompareStore();
  const { addItem } = useCartStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl my-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Side-by-Side Device Comparison</h3>
              <p className="text-xs text-slate-400">Comparing {items.length} of 3 devices</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 font-mono"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
            <button
              onClick={closeCompareModal}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-x-auto">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Smartphone className="w-12 h-12 text-slate-600 mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-white">No devices selected for comparison</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Click the comparison icon on any product card to compare specs side-by-side!
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="p-3 text-xs font-mono text-slate-400 w-1/4 uppercase tracking-wider">
                    Feature
                  </th>
                  {items.map((prod) => (
                    <th key={prod.id} className="p-3 text-center border-l border-slate-800/80 relative">
                      <button
                        onClick={() => removeCompare(prod.id)}
                        className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        title="Remove from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <img
                        src={prod.images[0]}
                        alt={prod.model}
                        className="w-20 h-20 object-cover rounded-xl mx-auto mb-2 bg-slate-950"
                      />
                      <h4 className="text-sm font-bold text-white">{prod.brand} {prod.model}</h4>
                      <div className="text-sm font-mono font-bold text-cyan-400 mt-1">${prod.price}</div>
                      <div className="mt-2">
                        {prod.condition === 'preowned' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded badge-glow-preowned text-cyan-300 font-mono inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-cyan-400" /> Grade {prod.gradeIfPreowned}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded badge-glow-new text-blue-300 font-mono">
                            Brand New
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                
                {/* Condition & Warranty */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300 bg-slate-950/40">Condition & Warranty</td>
                  {items.map((prod) => (
                    <td key={prod.id} className="p-3 text-center border-l border-slate-800/80 text-slate-300">
                      {prod.condition === 'preowned' 
                        ? `8-Point Inspected (Grade ${prod.gradeIfPreowned}) + 12M Warranty` 
                        : 'Brand New Sealed + 12M Manufacturer Warranty'}
                    </td>
                  ))}
                </tr>

                {/* Display */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300 bg-slate-950/40">Display</td>
                  {items.map((prod) => (
                    <td key={prod.id} className="p-3 text-center border-l border-slate-800/80 text-slate-300">
                      {prod.specs.display}
                    </td>
                  ))}
                </tr>

                {/* Processor */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300 bg-slate-950/40">Processor Chipset</td>
                  {items.map((prod) => (
                    <td key={prod.id} className="p-3 text-center border-l border-slate-800/80 text-slate-300">
                      {prod.specs.processor}
                    </td>
                  ))}
                </tr>

                {/* RAM & Memory */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300 bg-slate-950/40">System RAM</td>
                  {items.map((prod) => (
                    <td key={prod.id} className="p-3 text-center border-l border-slate-800/80 text-slate-300">
                      {prod.specs.ram || '8GB'}
                    </td>
                  ))}
                </tr>

                {/* Camera System */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300 bg-slate-950/40">Camera Optics</td>
                  {items.map((prod) => (
                    <td key={prod.id} className="p-3 text-center border-l border-slate-800/80 text-slate-300">
                      {prod.specs.camera}
                    </td>
                  ))}
                </tr>

                {/* Battery & Charging */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300 bg-slate-950/40">Battery & Charging</td>
                  {items.map((prod) => (
                    <td key={prod.id} className="p-3 text-center border-l border-slate-800/80 text-slate-300">
                      {prod.specs.battery}
                    </td>
                  ))}
                </tr>

                {/* Operating System */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300 bg-slate-950/40">Operating System</td>
                  {items.map((prod) => (
                    <td key={prod.id} className="p-3 text-center border-l border-slate-800/80 text-slate-300">
                      {prod.specs.os}
                    </td>
                  ))}
                </tr>

                {/* Pre-Owned Battery Health (if applicable) */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300 bg-slate-950/40">Battery Health Report</td>
                  {items.map((prod) => (
                    <td key={prod.id} className="p-3 text-center border-l border-slate-800/80 font-mono font-bold">
                      {prod.inspectionReport 
                        ? <span className="text-emerald-400">{prod.inspectionReport.batteryHealth}% Tested</span>
                        : <span className="text-slate-500">100% (New Factory Cell)</span>}
                    </td>
                  ))}
                </tr>

                {/* Add to Cart Actions */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300 bg-slate-950/40">Buy Action</td>
                  {items.map((prod) => (
                    <td key={prod.id} className="p-3 text-center border-l border-slate-800/80">
                      <button
                        onClick={() => {
                          addItem(prod);
                          closeCompareModal();
                        }}
                        className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-cyan-glow"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
