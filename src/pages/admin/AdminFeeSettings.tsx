import { useState } from 'react';
import { BadgePercent, CalendarClock, Clock3, Info, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  createFeeDuePolicy,
  createFeeRateSchedule,
  getApplicableFeeDuePolicy,
  getApplicableFeeRateSchedule,
  getFeeDuePolicies,
  getFeeRateSchedules,
} from '../../data/gate2bPlatformFeeData';

function formatRate(rate: number) {
  return `${rate.toFixed(2)}%`;
}

export default function AdminFeeSettings() {
  const { currentUser } = useApp();
  const [rate, setRate] = useState('3.00');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [reason, setReason] = useState('');
  const [dueDays, setDueDays] = useState('7');
  const [dueEffectiveDate, setDueEffectiveDate] = useState('');
  const [dueReason, setDueReason] = useState('');
  const [revision, setRevision] = useState(0);
  const [message, setMessage] = useState('');
  void revision;

  const schedules = getFeeRateSchedules();
  const current = getApplicableFeeRateSchedule();
  const duePolicies = getFeeDuePolicies();
  const currentDuePolicy = getApplicableFeeDuePolicy();
  const rateNum = Number.parseFloat(rate);
  const dueDaysNum = Number.parseInt(dueDays, 10);
  const validRate = Number.isFinite(rateNum) && rateNum >= 0 && rateNum <= 100;
  const validDueDays = Number.isInteger(dueDaysNum) && dueDaysNum >= 1 && dueDaysNum <= 365;
  const today = new Date().toISOString().slice(0, 10);

  const saveRate = () => {
    if (!currentUser) return;
    const result = createFeeRateSchedule({
      ratePercent: rateNum,
      effectiveFrom: effectiveDate,
      createdBy: currentUser.id,
      reason,
    });
    if ('error' in result) {
      setMessage(result.error ?? 'Unable to create the prospective fee schedule.');
      return;
    }
    setMessage(`Prospective fee schedule created: ${formatRate(result.schedule.ratePercent)} effective ${result.schedule.effectiveFrom.slice(0, 10)}.`);
    setEffectiveDate('');
    setReason('');
    setRevision(value => value + 1);
  };

  const saveDuePolicy = () => {
    if (!currentUser) return;
    const result = createFeeDuePolicy({
      duePeriodDays: dueDaysNum,
      effectiveFrom: dueEffectiveDate,
      createdBy: currentUser.id,
      reason: dueReason,
    });
    if ('error' in result) {
      setMessage(result.error ?? 'Unable to create the prospective fee due-period policy.');
      return;
    }
    setMessage(`Prospective fee due-period policy created: ${result.policy.duePeriodDays} calendar days effective ${result.policy.effectiveFrom.slice(0, 10)}.`);
    setDueEffectiveDate('');
    setDueReason('');
    setRevision(value => value + 1);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Success-Based Platform Fee Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Gate 2B controlled rate and due-period schedules. Existing Transaction snapshots and maturity deadlines remain immutable.</p>
        </div>
      </div>

      {message && <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">{message}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card border-green-200 bg-green-50">
          <div className="flex items-center gap-2">
            <BadgePercent size={20} className="text-green-700" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-green-700">Current Standard MVP Rate</div>
              <div className="text-3xl font-bold text-green-950">{formatRate(current.ratePercent)}</div>
            </div>
          </div>
          <div className="mt-3 text-sm text-green-800">Effective from {current.effectiveFrom.slice(0, 10)} · Schedule {current.id}</div>
        </div>
        <div className="card border-teal-200 bg-teal-50">
          <div className="flex items-center gap-2">
            <Clock3 size={20} className="text-teal-700" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-teal-700">Current Fee Due Period</div>
              <div className="text-3xl font-bold text-teal-950">{currentDuePolicy.duePeriodDays} days</div>
            </div>
          </div>
          <div className="mt-3 text-sm text-teal-800">Calendar days from each maturity event · Policy {currentDuePolicy.id}</div>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <CalendarClock size={19} className="text-amber-600" />
          <h2 className="section-title">Create Prospective Rate Schedule</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Future Rate (%)</label>
            <input type="number" className="input" min="0" max="100" step="0.01" value={rate} onChange={event => setRate(event.target.value)} />
          </div>
          <div>
            <label className="label">Effective Date</label>
            <input type="date" className="input" min={today} value={effectiveDate} onChange={event => setEffectiveDate(event.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Reason / Approval Basis</label>
          <textarea className="input resize-none" rows={3} value={reason} onChange={event => setReason(event.target.value)} placeholder="Reason for prospective fee-rate change" />
        </div>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <strong>Control:</strong> new rate schedules are future-dated only. They do not edit or recalculate the rate already locked to an existing Mutual Commitment.
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={saveRate} disabled={!validRate || !effectiveDate || !reason.trim()} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"><Save size={16} /> Create Rate Schedule</button>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 size={19} className="text-teal-700" />
          <h2 className="section-title">Create Prospective Due-Period Policy</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Due Period (Calendar Days)</label>
            <input type="number" className="input" min="1" max="365" step="1" value={dueDays} onChange={event => setDueDays(event.target.value)} />
          </div>
          <div>
            <label className="label">Effective Date</label>
            <input type="date" className="input" min={today} value={dueEffectiveDate} onChange={event => setDueEffectiveDate(event.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Reason / Approval Basis</label>
          <textarea className="input resize-none" rows={3} value={dueReason} onChange={event => setDueReason(event.target.value)} placeholder="Reason for prospective fee due-period change" />
        </div>
        <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs text-teal-800">
          <strong>Control:</strong> the applicable due-period policy is snapshotted when each fee portion matures. A later policy change never moves an existing maturity deadline.
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={saveDuePolicy} disabled={!validDueDays || !dueEffectiveDate || !dueReason.trim()} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"><Save size={16} /> Create Due Policy</button>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Effective-Dated Fee Schedule</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">{['Rate', 'Effective From', 'Stored Status', 'Created By', 'Reason'].map(label => <th key={label} className="px-2 py-3 text-left text-xs font-semibold text-gray-500">{label}</th>)}</tr></thead>
            <tbody>
              {schedules.map(schedule => (
                <tr key={schedule.id} className="border-b border-gray-50">
                  <td className="px-2 py-3 font-semibold text-gray-900">{formatRate(schedule.ratePercent)}</td>
                  <td className="px-2 py-3 text-gray-600">{schedule.effectiveFrom.slice(0, 10)}</td>
                  <td className="px-2 py-3"><span className={`badge text-xs ${schedule.effectiveFrom <= new Date().toISOString() ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{schedule.effectiveFrom <= new Date().toISOString() ? 'Effective' : schedule.status}</span></td>
                  <td className="px-2 py-3 text-xs text-gray-600">{schedule.createdBy}</td>
                  <td className="px-2 py-3 text-xs text-gray-600">{schedule.reason ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Effective-Dated Fee Due Policies</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">{['Calendar Days', 'Effective From', 'Stored Status', 'Created By', 'Reason'].map(label => <th key={label} className="px-2 py-3 text-left text-xs font-semibold text-gray-500">{label}</th>)}</tr></thead>
            <tbody>
              {duePolicies.map(policy => (
                <tr key={policy.id} className="border-b border-gray-50">
                  <td className="px-2 py-3 font-semibold text-gray-900">{policy.duePeriodDays}</td>
                  <td className="px-2 py-3 text-gray-600">{policy.effectiveFrom.slice(0, 10)}</td>
                  <td className="px-2 py-3"><span className={`badge text-xs ${policy.effectiveFrom <= new Date().toISOString() ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{policy.effectiveFrom <= new Date().toISOString() ? 'Effective' : policy.status}</span></td>
                  <td className="px-2 py-3 text-xs text-gray-600">{policy.createdBy}</td>
                  <td className="px-2 py-3 text-xs text-gray-600">{policy.reason ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card border-blue-200 bg-blue-50">
        <div className="flex items-start gap-2 text-sm text-blue-800"><Info size={17} className="mt-0.5 flex-shrink-0" /><p><strong>2B-2 boundary:</strong> this page controls prospective rate and due-period policy only. Fee maturity may now be derived from Supplier-confirmed Buyer receipts, but Supplier remittance, Ani Market fee-payment confirmation, billing credits, reminders, restrictions, suspension, waivers, refunds, disputes, and tax-document processing remain in later Gate 2B increments.</p></div>
      </div>
    </div>
  );
}
