import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, Mail, Phone, Save, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Logo from '../../components/Logo';
import { BUYER_TYPES, CROP_CATEGORIES, MUNICIPALITIES, PROVINCES } from '../../data/mockData';
import { saveVerificationRecord } from '../../data/gate1TrustData';
import type { MarketplaceRole, SupplierType } from '../../types';

const STEP_LABELS = ['Account', 'Role Profile', 'Location', 'Crops / Procurement', 'Evidence', 'Review'];

export default function OnboardingPage() {
  const { currentUser, currentRole, getRoleVerification, updateCurrentUserTrust } = useApp();
  const navigate = useNavigate();
  const role: MarketplaceRole | null = currentRole === 'buyer' || currentRole === 'supplier' ? currentRole : null;
  const roleState = role ? getRoleVerification(role) : null;

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [evidence, setEvidence] = useState({ identity: false, roleDocument: false });
  const [selectedCrops, setSelectedCrops] = useState<string[]>(currentUser?.supplierProfile?.cropInterests ?? []);
  const [form, setForm] = useState({
    organizationName: currentUser?.buyerProfile?.organizationName ?? currentUser?.supplierProfile?.farmOrOrganizationName ?? currentUser?.name ?? '',
    authorizedRepresentative: currentUser?.buyerProfile?.authorizedRepresentative ?? '',
    buyerType: currentUser?.buyerProfile?.businessType ?? BUYER_TYPES[0],
    supplierType: currentUser?.supplierProfile?.supplierType ?? currentUser?.supplierType ?? 'individual_farmer',
    province: currentUser?.province ?? 'Camarines Sur',
    municipality: currentUser?.municipality ?? '',
    procurementAddress: currentUser?.buyerProfile?.procurementAddress ?? '',
    procurementNotes: currentUser?.buyerProfile?.procurementNotes ?? '',
    availabilityNotes: currentUser?.supplierProfile?.availabilityNotes ?? '',
  });

  const update = (key: string, value: string) => setForm(current => ({ ...current, [key]: value }));
  const municipalities = MUNICIPALITIES[form.province] ?? [];
  const account = currentUser?.accountVerification;
  const accountVerified = account?.emailStatus === 'Verified' && account?.mobileStatus === 'Verified';
  const isMarketplaceVerified = roleState?.marketplaceVerificationStatus === 'Verified' && roleState.transactionAccessStatus === 'Enabled';
  const isPendingReview = roleState?.marketplaceVerificationStatus === 'Pending Review';

  const profileReady = useMemo(() => {
    if (!role) return false;
    if (!form.organizationName.trim() || !form.province || !form.municipality) return false;
    if (role === 'buyer') {
      return Boolean(form.buyerType && form.authorizedRepresentative.trim() && form.procurementAddress.trim());
    }
    return Boolean(form.supplierType && selectedCrops.length > 0);
  }, [form, role, selectedCrops.length]);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (!role) return <Navigate to="/admin/dashboard" replace />;

  const roleLabel = role === 'supplier' ? 'Farmer / Supplier' : 'Buyer / Business';

  const saveProfileState = (progress: string) => {
    const onboardingProgress = { ...currentUser.onboardingProgress, [role]: progress };
    if (role === 'buyer') {
      updateCurrentUserTrust({
        buyerProfile: {
          userId: currentUser.id,
          organizationName: form.organizationName,
          businessType: form.buyerType,
          authorizedRepresentative: form.authorizedRepresentative,
          procurementAddress: form.procurementAddress || `${form.municipality}, ${form.province}`,
          procurementNotes: form.procurementNotes,
        },
        onboardingProgress,
      });
    } else {
      updateCurrentUserTrust({
        supplierProfile: {
          userId: currentUser.id,
          supplierType: form.supplierType as SupplierType,
          farmOrOrganizationName: form.organizationName,
          operatingLocation: `${form.municipality}, ${form.province}`,
          cropInterests: selectedCrops,
          availabilityNotes: form.availabilityNotes,
        },
        onboardingProgress,
      });
    }
  };

  const verifyChannel = (channel: 'email' | 'mobile') => {
    const timestamp = new Date().toISOString();
    updateCurrentUserTrust({
      accountVerification: {
        emailStatus: channel === 'email' ? 'Verified' : account?.emailStatus ?? 'Unverified',
        mobileStatus: channel === 'mobile' ? 'Verified' : account?.mobileStatus ?? 'Unverified',
        emailVerifiedAt: channel === 'email' ? timestamp : account?.emailVerifiedAt,
        mobileVerifiedAt: channel === 'mobile' ? timestamp : account?.mobileVerifiedAt,
      },
    });
  };

  const handleSaveForLater = () => {
    saveProfileState(STEP_LABELS[step - 1]);
    alert('Onboarding progress saved on this device. You can continue later.');
  };

  const handleSubmitForVerification = () => {
    if (!accountVerified || !profileReady || !evidence.identity || !evidence.roleDocument) return;
    const timestamp = new Date().toISOString();
    const nextRoleState = {
      ...(roleState ?? {
        role,
        profileCompleteness: 'Not Started' as const,
        marketplaceVerificationStatus: 'Not Submitted' as const,
        transactionAccessStatus: 'Disabled' as const,
      }),
      role,
      profileCompleteness: 'Complete' as const,
      marketplaceVerificationStatus: 'Pending Review' as const,
      transactionAccessStatus: 'Disabled' as const,
      submittedAt: timestamp,
      decisionReason: undefined,
    };

    saveProfileState('Submitted for Verification');
    updateCurrentUserTrust({
      roleVerifications: { ...currentUser.roleVerifications, [role]: nextRoleState },
      onboardingProgress: { ...currentUser.onboardingProgress, [role]: 'Submitted for Verification' },
    });
    saveVerificationRecord({
      id: `vr-${currentUser.id}-${role}-${Date.now()}`,
      userId: currentUser.id,
      role,
      fromStatus: roleState?.marketplaceVerificationStatus,
      toStatus: 'Pending Review',
      eventType: 'Submitted',
      actorId: currentUser.id,
      actorRole: role,
      createdAt: timestamp,
    });
    setSubmitted(true);
  };

  const dashboardPath = role === 'buyer' ? '/buyer/dashboard' : '/supplier/dashboard';

  if (submitted || isPendingReview) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <ShieldCheck size={28} className="text-amber-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace verification pending</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Your {roleLabel} profile has been submitted for Ani Market review. You may continue using non-transaction features, but actionable marketplace transactions remain disabled until this role is verified.
          </p>
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-sm">
            <div className="flex justify-between gap-3"><span className="text-gray-500">Profile completeness</span><strong>Complete</strong></div>
            <div className="mt-2 flex justify-between gap-3"><span className="text-gray-500">Marketplace verification</span><strong>Pending Review</strong></div>
            <div className="mt-2 flex justify-between gap-3"><span className="text-gray-500">Transaction access</span><strong>Disabled</strong></div>
          </div>
          <button onClick={() => navigate(dashboardPath)} className="btn-primary mt-6 w-full justify-center">Continue to Dashboard</button>
        </div>
      </div>
    );
  }

  if (isMarketplaceVerified) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle size={46} className="mx-auto text-green-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">{roleLabel} profile verified</h1>
          <p className="mt-3 text-sm text-gray-600">This role is marketplace verified and transaction enabled. Onboarding details may still be reviewed or updated from your profile.</p>
          <button onClick={() => navigate(dashboardPath)} className="btn-primary mt-6 w-full justify-center">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex justify-center mb-7"><Link to="/"><Logo size="lg" /></Link></div>

        <div className="mb-7 overflow-x-auto">
          <div className="flex min-w-[620px] items-center justify-center gap-2">
            {STEP_LABELS.map((label, index) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${index + 1 <= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {index + 1 < step ? <CheckCircle size={16} /> : index + 1}
                  </div>
                  <span className="text-[10px] font-medium text-gray-500">{label}</span>
                </div>
                {index < STEP_LABELS.length - 1 && <div className={`mb-4 h-0.5 w-10 ${index + 1 < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">{roleLabel} onboarding</p>
              <h1 className="mt-1 text-xl font-bold text-gray-900">{STEP_LABELS[step - 1]}</h1>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Step {step} of {STEP_LABELS.length}</span>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Verify both account channels before your role can be submitted for marketplace verification.</p>
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3"><Mail size={18} className="text-gray-500" /><div><div className="text-sm font-semibold">Email</div><div className="text-xs text-gray-500">{currentUser.email}</div></div></div>
                  {account?.emailStatus === 'Verified' ? <span className="badge bg-green-100 text-green-700">Verified</span> : <button onClick={() => verifyChannel('email')} className="btn-secondary text-xs">Verify demo email</button>}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3"><Phone size={18} className="text-gray-500" /><div><div className="text-sm font-semibold">Mobile</div><div className="text-xs text-gray-500">{currentUser.contactNumber}</div></div></div>
                  {account?.mobileStatus === 'Verified' ? <span className="badge bg-green-100 text-green-700">Verified</span> : <button onClick={() => verifyChannel('mobile')} className="btn-secondary text-xs">Verify demo mobile</button>}
                </div>
              </div>
              <p className="text-xs text-gray-400">Prototype behavior only: verification buttons simulate successful OTP/email confirmation. Production verification will use controlled external services.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div><label className="label">{role === 'buyer' ? 'Business / Organization Name' : 'Farm / Organization Name'} *</label><input className="input" value={form.organizationName} onChange={event => update('organizationName', event.target.value)} /></div>
              {role === 'buyer' ? (
                <>
                  <div><label className="label">Buyer / Business Type *</label><select className="input" value={form.buyerType} onChange={event => update('buyerType', event.target.value)}>{BUYER_TYPES.map(type => <option key={type}>{type}</option>)}</select></div>
                  <div><label className="label">Authorized Representative *</label><input className="input" value={form.authorizedRepresentative} onChange={event => update('authorizedRepresentative', event.target.value)} placeholder="Name or position authorized to transact" /></div>
                </>
              ) : (
                <div><label className="label">Supplier Type *</label><select className="input" value={form.supplierType} onChange={event => update('supplierType', event.target.value)}><option value="individual_farmer">Individual Farmer</option><option value="cooperative">Cooperative / Association</option><option value="organized_supplier">Organized Supplier</option><option value="aggregator">Crop Aggregator</option></select></div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className="label">Province *</label><select className="input" value={form.province} onChange={event => { update('province', event.target.value); update('municipality', ''); }}>{PROVINCES.map(province => <option key={province}>{province}</option>)}</select></div>
                <div><label className="label">Municipality / City *</label><select className="input" value={form.municipality} onChange={event => update('municipality', event.target.value)}><option value="">Select municipality</option>{municipalities.map(municipality => <option key={municipality}>{municipality}</option>)}</select></div>
              </div>
              {role === 'buyer' && <div><label className="label">Procurement / Business Address *</label><input className="input" value={form.procurementAddress} onChange={event => update('procurementAddress', event.target.value)} placeholder="Primary procurement or receiving address" /></div>}
              {role === 'supplier' && <div className="rounded-xl border border-green-100 bg-green-50 p-3 text-xs text-green-800">Operating location is stored separately from your account identity so supplier verification remains role-specific.</div>}
              <p className="text-xs text-gray-400">Initial MVP service areas are controlled by Ani Market configuration; they are not intended to be a permanent hard-coded geography.</p>
            </div>
          )}

          {step === 4 && role === 'supplier' && (
            <div className="space-y-4">
              <div><label className="label">Crops you can supply *</label><div className="mt-2 flex flex-wrap gap-2">{CROP_CATEGORIES.map(category => { const selected = selectedCrops.includes(category); return <button key={category} type="button" onClick={() => setSelectedCrops(current => selected ? current.filter(item => item !== category) : [...current, category])} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${selected ? 'border-green-500 bg-green-100 text-green-800' : 'border-gray-200 bg-white text-gray-600'}`}>{category}</button>; })}</div></div>
              <div><label className="label">Availability / Harvest Notes</label><textarea className="input resize-none" rows={3} value={form.availabilityNotes} onChange={event => update('availabilityNotes', event.target.value)} placeholder="Typical availability, harvest periods, supply notes..." /></div>
            </div>
          )}

          {step === 4 && role === 'buyer' && (
            <div className="space-y-4">
              <div><label className="label">Procurement Profile Notes</label><textarea className="input resize-none" rows={4} value={form.procurementNotes} onChange={event => update('procurementNotes', event.target.value)} placeholder="Typical commodity requirements, receiving preferences, procurement context..." /></div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">Typical commodity requirements help suppliers understand your procurement context, but they do not replace a qualified Demand Post.</div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">For the prototype, mark the supporting evidence as supplied. No actual file is uploaded.</p>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4"><input type="checkbox" className="mt-1" checked={evidence.identity} onChange={event => setEvidence(current => ({ ...current, identity: event.target.checked }))} /><div><div className="text-sm font-semibold text-gray-900">Identity / authorized representative evidence</div><div className="text-xs text-gray-500">Basic, risk-proportionate evidence for marketplace verification.</div></div></label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4"><input type="checkbox" className="mt-1" checked={evidence.roleDocument} onChange={event => setEvidence(current => ({ ...current, roleDocument: event.target.checked }))} /><div><div className="text-sm font-semibold text-gray-900">{role === 'supplier' ? 'Farm / organization supporting evidence' : 'Business / organization supporting evidence'}</div><div className="text-xs text-gray-500">Evidence is role-specific and does not verify creditworthiness or product quality.</div></div></label>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
                <div className="flex justify-between gap-4"><span className="text-gray-500">Role</span><strong>{roleLabel}</strong></div>
                <div className="mt-2 flex justify-between gap-4"><span className="text-gray-500">Email & mobile</span><strong>{accountVerified ? 'Verified' : 'Incomplete'}</strong></div>
                <div className="mt-2 flex justify-between gap-4"><span className="text-gray-500">Profile</span><strong>{profileReady ? 'Complete' : 'Incomplete'}</strong></div>
                <div className="mt-2 flex justify-between gap-4"><span className="text-gray-500">Evidence</span><strong>{evidence.identity && evidence.roleDocument ? 'Supplied' : 'Incomplete'}</strong></div>
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-xs leading-relaxed text-green-800">
                By submitting, you confirm the information is accurate and authorize Ani Market to review this role profile for marketplace participation. A Verified badge indicates Ani Market marketplace verification only; it is not a government, credit, quality, or performance guarantee.
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3 border-t border-gray-100 pt-5">
            {step > 1 && <button onClick={() => setStep(current => current - 1)} className="btn-secondary flex-1 justify-center">Back</button>}
            <button onClick={handleSaveForLater} className="btn-secondary flex-1 justify-center"><Save size={15} /> Save & Continue Later</button>
            {step < STEP_LABELS.length ? (
              <button onClick={() => { saveProfileState(STEP_LABELS[step - 1]); setStep(current => current + 1); }} className="btn-primary flex-1 justify-center">Continue <ChevronRight size={16} /></button>
            ) : (
              <button onClick={handleSubmitForVerification} disabled={!accountVerified || !profileReady || !evidence.identity || !evidence.roleDocument} className="btn-primary flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50">Submit for Verification</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
