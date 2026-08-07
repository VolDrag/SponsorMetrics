// ifty
import { useEffect, useMemo, useState } from 'react';

const TierCard = ({ tier, benefitPresets, onSave, onDelete, saving, deleting }) => {
  const [name, setName] = useState(tier.name || '');
  const [price, setPrice] = useState(tier.price || 0);
  const [isCustom, setIsCustom] = useState(Boolean(tier.isCustom));
  const [benefits, setBenefits] = useState(Array.isArray(tier.benefits) ? tier.benefits : []);
  const [customLabel, setCustomLabel] = useState('');
  const [customDetail, setCustomDetail] = useState('');

  useEffect(() => {
    setName(tier.name || '');
    setPrice(tier.price || 0);
    setIsCustom(Boolean(tier.isCustom));
    setBenefits(Array.isArray(tier.benefits) ? tier.benefits : []);
  }, [tier]);

  const presetMap = useMemo(
    () => new Map(benefitPresets.map((preset) => [preset.label, preset])),
    [benefitPresets]
  );

  const hasBenefit = (label) => benefits.some((benefit) => benefit.label === label);

  const handleTogglePreset = (preset) => {
    const exists = hasBenefit(preset.label);
    if (exists) {
      setBenefits((prev) => prev.filter((benefit) => benefit.label !== preset.label));
      return;
    }

    setBenefits((prev) => [...prev, { label: preset.label, detail: preset.detail }]);
  };

  const handleBenefitDetailChange = (label, detail) => {
    setBenefits((prev) => prev.map((benefit) => (benefit.label === label ? { ...benefit, detail } : benefit)));
  };

  const customBenefits = benefits.filter((benefit) => !presetMap.has(benefit.label));

  const handleAddCustomBenefit = () => {
    const label = customLabel.trim();
    const detail = customDetail.trim();

    if (!label || !detail) {
      return;
    }

    if (benefits.some((benefit) => benefit.label.toLowerCase() === label.toLowerCase())) {
      return;
    }

    setBenefits((prev) => [...prev, { label, detail }]);
    setCustomLabel('');
    setCustomDetail('');
  };

  const handleRemoveCustomBenefit = (label) => {
    setBenefits((prev) => prev.filter((benefit) => benefit.label !== label));
  };

  const handleSave = () => {
    onSave({
      name: name.trim(),
      price: Number(price),
      isCustom,
      benefits: benefits
        .filter((benefit) => benefit.label.trim() && benefit.detail.trim())
        .map((benefit) => ({ label: benefit.label.trim(), detail: benefit.detail.trim() })),
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Tier Name</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            placeholder="Gold"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Price (BDT)</label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={isCustom}
          onChange={(event) => setIsCustom(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        Custom tier name
      </label>

      <div className="mt-4">
        <h4 className="text-sm font-semibold text-slate-800">Benefits Checklist</h4>
        <div className="mt-2 space-y-2">
          {benefitPresets.map((preset) => (
            <div key={preset.label} className="rounded-lg border border-slate-200 p-3">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={hasBenefit(preset.label)}
                  onChange={() => handleTogglePreset(preset)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-800">{preset.label}</span>
              </label>
              {hasBenefit(preset.label) ? (
                <input
                  type="text"
                  value={benefits.find((benefit) => benefit.label === preset.label)?.detail || ''}
                  onChange={(event) => handleBenefitDetailChange(preset.label, event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-3">
        <h5 className="text-sm font-semibold text-slate-800">Add Custom Benefit</h5>
        <div className="mt-2 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            value={customLabel}
            onChange={(event) => setCustomLabel(event.target.value)}
            placeholder="Label (e.g. Media Coverage)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            value={customDetail}
            onChange={(event) => setCustomDetail(event.target.value)}
            placeholder="Detail (e.g. 3 national press mentions)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleAddCustomBenefit}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {customBenefits.map((benefit) => (
            <div key={benefit.label} className="flex items-center justify-between rounded-md bg-slate-100 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">{benefit.label}</p>
                <p className="text-sm text-slate-600">{benefit.detail}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCustomBenefit(benefit.label)}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Tier'}
        </button>
      </div>
    </div>
  );
};

export default TierCard;
// ifty end
