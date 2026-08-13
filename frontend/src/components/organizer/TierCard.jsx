import React, { useEffect, useMemo, useState } from 'react';
import { Award, CircleDollarSign, Star, Plus, X, Check } from 'lucide-react';

const TIER_ICONS = [Award, CircleDollarSign, Star];
const TIER_LABELS = ['TIER ONE', 'TIER TWO', 'TIER THREE', 'TIER FOUR', 'TIER FIVE'];

const TIER_STYLES = [
  {
    cardBorder: 'border-amber-300',
    cardBg: 'bg-amber-50',
    cardShadow: 'shadow-[0_0_0_1px_theme(colors.amber.300)]',
    labelText: 'text-amber-700',
    iconBorder: 'border-amber-400 text-amber-600',
    checkBg: 'bg-amber-500',
    checkBorder: 'border-amber-500',
    nameText: 'text-[#161B2E]',
    priceText: 'text-[#161B2E]',
  },
  {
    cardBorder: 'border-slate-200',
    cardBg: 'bg-slate-50',
    cardShadow: '',
    labelText: 'text-slate-500',
    iconBorder: 'border-slate-300 text-slate-400',
    checkBg: 'bg-slate-500',
    checkBorder: 'border-slate-500',
    nameText: 'text-[#161B2E]',
    priceText: 'text-[#161B2E]',
  },
  {
    cardBorder: 'border-orange-200',
    cardBg: 'bg-orange-50',
    cardShadow: '',
    labelText: 'text-orange-700',
    iconBorder: 'border-orange-300 text-orange-500',
    checkBg: 'bg-orange-500',
    checkBorder: 'border-orange-500',
    nameText: 'text-[#161B2E]',
    priceText: 'text-[#161B2E]',
  },
];

const safeNormalizeBenefits = (rawBenefits) => {
  if (!Array.isArray(rawBenefits)) return [];
  return rawBenefits
    .map((b) => {
      if (!b) return null;
      if (typeof b === 'string') return { label: b, detail: b };
      const label = b.label || b.name || b.title || '';
      const detail = b.detail || b.description || b.value || label || '';
      if (!label) return null;
      return { label: String(label), detail: String(detail) };
    })
    .filter(Boolean);
};

const TierCard = ({ tier = {}, index = 0, benefitPresets = [], onSave, onDelete, saving, deleting }) => {
  const [name, setName] = useState(tier?.name || '');
  const [price, setPrice] = useState(tier?.price || 0);
  const [isCustom, setIsCustom] = useState(Boolean(tier?.isCustom));
  const [benefits, setBenefits] = useState(safeNormalizeBenefits(tier?.benefits));
  const [customLabel, setCustomLabel] = useState('');
  const [customDetail, setCustomDetail] = useState('');

  useEffect(() => {
    setName(tier?.name || '');
    setPrice(tier?.price || 0);
    setIsCustom(Boolean(tier?.isCustom));
    setBenefits(safeNormalizeBenefits(tier?.benefits));
  }, [tier]);

  const presetMap = useMemo(
    () => new Map((benefitPresets || []).map((preset) => [preset.label, preset])),
    [benefitPresets]
  );

  const getBenefit = (label) => benefits.find((benefit) => benefit && benefit.label === label);
  const hasBenefit = (label) => Boolean(getBenefit(label));

  const handleTogglePreset = (preset) => {
    if (hasBenefit(preset.label)) {
      setBenefits((prev) => prev.filter((benefit) => benefit && benefit.label !== preset.label));
      return;
    }
    setBenefits((prev) => [...prev, { label: preset.label, detail: preset.detail }]);
  };

  const handleDetailChange = (label, detail) => {
    setBenefits((prev) => prev.map((b) => (b && b.label === label ? { ...b, detail } : b)));
  };

  const customBenefits = benefits.filter((benefit) => benefit && benefit.label && !presetMap.has(benefit.label));

  const handleAddCustomBenefit = () => {
    const label = customLabel.trim();
    const detail = customDetail.trim();
    if (!label || !detail) return;
    if (benefits.some((b) => b && b.label && b.label.toLowerCase() === label.toLowerCase())) return;

    setBenefits((prev) => [...prev, { label, detail }]);
    setCustomLabel('');
    setCustomDetail('');
  };

  const handleRemoveCustomBenefit = (label) => {
    setBenefits((prev) => prev.filter((benefit) => benefit && benefit.label !== label));
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        name: name.trim(),
        price: Number(price),
        isCustom,
        benefits: benefits
          .filter((b) => b && b.label && b.label.trim() && b.detail && b.detail.trim())
          .map((b) => ({ label: b.label.trim(), detail: b.detail.trim() })),
      });
    }
  };

  const style = TIER_STYLES[index % TIER_STYLES.length];
  const Icon = TIER_ICONS[index % TIER_ICONS.length];
  const featured = index === 0;

  return (
    <div
      className={`flex flex-col rounded-2xl border p-5 transition-shadow ${style.cardBorder} ${style.cardBg} ${
        featured ? style.cardShadow : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-bold tracking-wider uppercase ${style.labelText}`}>
            {TIER_LABELS[index] || `TIER ${index + 1}`}
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tier name"
            className={`mt-0.5 w-full bg-transparent font-display text-2xl font-bold ${style.nameText} outline-none placeholder:text-slate-300`}
          />
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${style.iconBorder} ml-3`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>

      {/* Price */}
      <div className="mt-3 flex items-baseline gap-1">
        <span className={`font-display text-2xl font-bold ${style.priceText}`}>৳</span>
        <input
          type="number"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={`w-28 bg-transparent font-display text-2xl font-bold ${style.priceText} outline-none placeholder:text-slate-300`}
        />
        <span className="text-xs font-medium text-slate-400">/ Event</span>
      </div>

      {/* Benefits List */}
      <div className="mt-4 space-y-2.5 border-t border-slate-200/70 pt-4">
        {(benefitPresets || []).map((preset) => {
          const included = hasBenefit(preset.label);
          const benefit = getBenefit(preset.label);
          return (
            <label
              key={preset.label}
              className="flex items-start gap-2.5 cursor-pointer group"
            >
              <div className="mt-0.5 shrink-0">
                {included ? (
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-sm ${style.checkBg}`}
                  >
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-slate-300 group-hover:border-slate-400 transition-colors" />
                )}
              </div>
              <input
                type="checkbox"
                checked={included}
                onChange={() => handleTogglePreset(preset)}
                className="sr-only"
              />
              {included ? (
                <div className="flex-1 text-sm text-[#2B3245]">
                  <span className="font-semibold text-slate-800">{preset.label}: </span>
                  <input
                    type="text"
                    value={benefit?.detail || ''}
                    onChange={(e) => handleDetailChange(preset.label, e.target.value)}
                    className="w-full bg-transparent text-sm text-[#2B3245] outline-none border-b border-dashed border-slate-300 focus:border-amber-500 mt-0.5"
                  />
                </div>
              ) : (
                <span className="text-sm text-slate-400 select-none font-medium">{preset.label}</span>
              )}
            </label>
          );
        })}

        {customBenefits.map((benefit, idx) => (
          <div key={benefit.label || idx} className="flex items-center gap-2.5">
            <div
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm ${style.checkBg}`}
            >
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </div>
            <span className="flex-1 text-sm text-[#2B3245]">
              <span className="font-semibold">{benefit.label}</span>
              {benefit.detail && benefit.detail !== benefit.label ? ` — ${benefit.detail}` : ''}
            </span>
            <button
              type="button"
              onClick={() => handleRemoveCustomBenefit(benefit.label)}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Custom Benefit */}
      <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-3 bg-white/60">
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Benefit label"
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 bg-white"
          />
          <input
            type="text"
            value={customDetail}
            onChange={(e) => setCustomDetail(e.target.value)}
            placeholder="e.g. 3 national press mentions"
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 bg-white"
          />
          <button
            type="button"
            onClick={handleAddCustomBenefit}
            className="flex items-center justify-center gap-1 rounded-md bg-[#161B2E] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2B3245] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add
          </button>
        </div>
      </div>

      {/* Custom Tier Toggle */}
      <label className="mt-4 flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
        <input
          type="checkbox"
          checked={isCustom}
          onChange={(e) => setIsCustom(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
        />
        Custom tier
      </label>

      {/* Actions */}
      <div className="mt-5 flex justify-end gap-2 border-t border-slate-200/70 pt-4">
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60 transition-colors shadow-sm"
        >
          {saving ? 'Saving...' : 'Save Tier'}
        </button>
      </div>
    </div>
  );
};

export default TierCard;