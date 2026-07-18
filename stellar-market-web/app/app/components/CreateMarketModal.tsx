'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Info } from 'lucide-react';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (marketData: {
    title: string;
    description: string;
    category: string;
    resolutionDate: string;
    oracleSource: string;
    initialLiquidity: string;
    tags: string;
  }) => void;
}

export default function CreateMarketModal({ isOpen, onClose, onCreate }: CreateMarketModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Crypto');
  const [resolutionDate, setResolutionDate] = useState('');
  const [oracleSource, setOracleSource] = useState('');
  const [initialLiquidity, setInitialLiquidity] = useState('500');
  const [tags, setTags] = useState('');

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !resolutionDate || !oracleSource.trim()) {
      alert('Please fill out all required fields.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      onCreate({
        title,
        description,
        category,
        resolutionDate,
        oracleSource,
        initialLiquidity,
        tags,
      });
      setSubmitting(false);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Crypto');
      setResolutionDate('');
      setOracleSource('');
      setInitialLiquidity('500');
      setTags('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090909]/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Card */}
      <div className="w-full max-w-lg bg-[#121212] border border-[#232323] rounded-[24px] overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#232323]">
          <h3 className="text-lg font-extrabold text-white">Create Prediction Market</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-[#232323] hover:border-gray-500 hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Market Title (Required)
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Will Bitcoin exceed $150,000 in 2026?"
              className="h-11 bg-[#090909] border border-[#232323] focus:border-[#14F195] rounded-xl text-sm px-4 text-white focus:outline-none placeholder-gray-600 font-semibold"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Resolution Criteria & Description (Required)
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what determines the YES and NO outcomes..."
              className="bg-[#090909] border border-[#232323] focus:border-[#14F195] rounded-xl text-sm p-4 text-white focus:outline-none placeholder-gray-600 font-semibold resize-none"
            />
          </div>

          {/* Category & Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 bg-[#090909] border border-[#232323] focus:border-[#14F195] rounded-xl text-sm px-3 text-white focus:outline-none font-semibold cursor-pointer"
              >
                <option value="Crypto">Crypto</option>
                <option value="Politics">Politics</option>
                <option value="Sports">Sports</option>
                <option value="Finance">Finance</option>
                <option value="AI">AI</option>
                <option value="World">World</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Resolution Date (Required)
              </label>
              <input
                type="date"
                required
                value={resolutionDate}
                onChange={(e) => setResolutionDate(e.target.value)}
                className="h-11 bg-[#090909] border border-[#232323] focus:border-[#14F195] rounded-xl text-sm px-4 text-white focus:outline-none font-semibold cursor-pointer"
              />
            </div>
          </div>

          {/* Oracle Source */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
              Oracle / Information Source (Required)
              <span className="text-gray-600 cursor-help" title="Web source or API endpoint verifying resolution.">
                <Info className="w-3.5 h-3.5" />
              </span>
            </label>
            <input
              type="text"
              required
              value={oracleSource}
              onChange={(e) => setOracleSource(e.target.value)}
              placeholder="e.g. CoinGecko API spot indices / NOAA records"
              className="h-11 bg-[#090909] border border-[#232323] focus:border-[#14F195] rounded-xl text-sm px-4 text-white focus:outline-none placeholder-gray-600 font-semibold"
            />
          </div>

          {/* Initial Liquidity & Tags Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Initial Liquidity (XLM)
              </label>
              <input
                type="number"
                value={initialLiquidity}
                onChange={(e) => setInitialLiquidity(e.target.value)}
                className="h-11 bg-[#090909] border border-[#232323] focus:border-[#14F195] rounded-xl text-sm px-4 text-white focus:outline-none font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. btc, bull, long"
                className="h-11 bg-[#090909] border border-[#232323] focus:border-[#14F195] rounded-xl text-sm px-4 text-white focus:outline-none placeholder-gray-600 font-semibold"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-4 mt-4 border-t border-[#232323] pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl bg-transparent hover:bg-white/5 border border-[#232323] text-gray-400 hover:text-white text-sm font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-12 rounded-xl bg-white hover:bg-gray-200 text-black text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Proposing Market...</span>
                </>
              ) : (
                <span>Propose Market</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer info banner */}
        <div className="bg-[#090909] px-6 py-4 flex items-center justify-center gap-1.5 border-t border-[#232323] text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#14F195]" />
          Requires validator approval (Soroban transaction)
        </div>
      </div>
    </div>
  );
}
