import { useState } from 'react';
import { BadgePercent, Info, Save, AlertTriangle } from 'lucide-react';
import {
  formatConvenienceFeeRate,
  getConvenienceFeeRate,
  saveConvenienceFeeRate,
} from '../../config/convenienceFee';

const history = [
  { rate: '3%', effective: '2025-01-01', status: 'Active', modifiedBy: 'Ani Market Admin', modifiedAt: '2024-12-15' },
  { rate: '2.5%', effective: '2024-09-01', status: 'Superseded', modifiedBy: 'Ani Market Admin', modifiedAt: '2024-08-20' },
];

export default function AdminFeeSettings() {
  const [rate, setRate] = useState(() => String(getConvenienceFeeRate()));
  const rateNum = Number.parseFloat(rate || '0');
  const rateWarning = rateNum > 10;
  const validRate = Number.isFinite(rateNum) && rateNum >= 0 && rateNum <= 100;

  const save = () => {
    if (!validRate) {
      alert('Enter a valid convenience fee rate from 0% to 100%.');
      return;
    }

    saveConvenienceFeeRate(rateNum);
    alert(`Convenience fee setting saved: ${formatConvenienceFeeRate(rateNum)} (Prototype)`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Convenience Fee Settings</h1>
      </div>

      <div className="card bg-amber-50 border-amber-200">
        <div className="flex items-center gap-2 mb-4">
          <BadgePercent size={20} className="text-amber-600" />
          <h2 className="text-lg font-bold text-amber-800">Convenience Fee Configuration</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="sm:col-span-1">
            <label className="label">Current Convenience Fee Rate (%)</label>
            <div className="relative">
              <input
                type="number"
                className={`input pr-8 ${rateWarning ? 'border-red-400 focus:border-red-500' : ''}`}
                min="0"
                max="100"
                step="0.1"
                value={rate}
                onChange={e => setRate(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </div>
          <div>
            <label className="label">Effective Date</label>
            <input type="date" className="input" defaultValue="2025-01-01" />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input">
              <option>Active</option>
              <option>Draft</option>
              <option>Superseded</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input resize-none"
            rows={2}
            defaultValue="Low convenience fee applied according to the active platform setting. The public landing page reads the current rate from this setting."
          />
        </div>

        <div className="mt-5 p-4 bg-white rounded-xl border border-amber-200">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700">
              <strong>Convenience Fee Principles:</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside text-xs">
                <li>The public site displays the currently active numeric rate</li>
                <li>The rate is configurable by an authorized administrator</li>
                <li>The fee applies according to the approved transaction-stage policy</li>
                <li>Ani Market does not process, hold, escrow, settle, or release buyer-seller funds</li>
              </ul>
            </div>
          </div>
        </div>

        {rateWarning && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">
              <strong>Warning:</strong> A convenience fee rate above 10% is unusually high. Confirm that this is intentional.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mt-5 gap-4">
          <div className="text-sm text-gray-500">
            Example: ₱540,000 transaction × {rate || '0'}% ={' '}
            <strong>₱{Math.round(540000 * (Number.isFinite(rateNum) ? rateNum : 0) / 100).toLocaleString()}</strong> fee
          </div>
          <button onClick={save} disabled={!validRate} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            <Save size={16} /> Save Fee Settings
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Fee History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Rate', 'Effective Date', 'Status', 'Modified By', 'Modified At'].map(h => (
                  <th key={h} className="text-left py-3 px-2 text-xs text-gray-500 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 px-2 font-semibold text-gray-900">{row.rate}</td>
                  <td className="py-3 px-2 text-gray-600">{row.effective}</td>
                  <td className="py-3 px-2">
                    <span className={`badge text-xs ${row.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{row.status}</span>
                  </td>
                  <td className="py-3 px-2 text-gray-600 text-xs">{row.modifiedBy}</td>
                  <td className="py-3 px-2 text-gray-600 text-xs">{row.modifiedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
