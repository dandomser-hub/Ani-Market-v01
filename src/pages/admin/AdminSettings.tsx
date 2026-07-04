import { Settings, Database, Bell, Shield, Users } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
      </div>

      {[
        {
          icon: <Settings size={20} className="text-gray-600" />,
          title: 'General Settings',
          items: [
            { label: 'Platform Name', value: 'Ani Market', type: 'text' },
            { label: 'MVP Geographic Scope', value: 'Mainland Bicol', type: 'text', readonly: true },
            { label: 'Commodity Scope', value: 'All Philippine Agricultural Crops', type: 'text', readonly: true },
          ],
        },
        {
          icon: <Shield size={20} className="text-amber-600" />,
          title: 'Matching Rules',
          items: [
            { label: 'Matching Mode', value: 'First-Come-First-Serve (Lean MVP)', type: 'text', readonly: true },
            { label: 'Multi-Supplier Fulfillment', value: 'Disabled (Lean MVP)', type: 'text', readonly: true },
            { label: 'Partial Fulfillment', value: 'Disabled (Lean MVP)', type: 'text', readonly: true },
          ],
        },
        {
          icon: <Bell size={20} className="text-blue-600" />,
          title: 'Notification Settings',
          items: [
            { label: 'Email Notifications', value: 'Enabled', type: 'select', options: ['Enabled', 'Disabled'] },
            { label: 'Admin Review Queue Alerts', value: 'Enabled', type: 'select', options: ['Enabled', 'Disabled'] },
          ],
        },
        {
          icon: <Users size={20} className="text-purple-600" />,
          title: 'User & Role Controls',
          items: [
            { label: 'Auto-Approve Registration', value: 'Disabled', type: 'select', options: ['Enabled', 'Disabled'] },
            { label: 'Admin Required for Role Switch', value: 'Enabled', type: 'select', options: ['Enabled', 'Disabled'] },
          ],
        },
        {
          icon: <Database size={20} className="text-green-600" />,
          title: 'Future / Deferred Features',
          future: true,
          items: [
            { label: 'AI-Assisted Matching', value: 'Deferred — Post-MVP', type: 'text', readonly: true },
            { label: 'Blockchain Traceability', value: 'Deferred — Post-MVP', type: 'text', readonly: true },
            { label: 'Multi-Supplier Fulfillment', value: 'Deferred — Post-MVP', type: 'text', readonly: true },
            { label: 'Island Province Expansion', value: 'Deferred — Pilot 2', type: 'text', readonly: true },
          ],
        },
      ].map(group => (
        <div key={group.title} className={`card ${group.future ? 'opacity-60 border-dashed border-gray-300' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            {group.icon}
            <h2 className="section-title">{group.title}</h2>
            {group.future && <span className="badge bg-gray-100 text-gray-500 ml-auto">Deferred / Future</span>}
          </div>
          <div className="space-y-3">
            {group.items.map(item => (
              <div key={item.label} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                <label className="text-sm text-gray-600">{item.label}</label>
                {item.type === 'select' && 'options' in item && item.options ? (
                  <select className="input text-sm" defaultValue={item.value} disabled={group.future}>
                    {(item.options as string[]).map((o: string) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className="input text-sm" defaultValue={item.value} readOnly={'readonly' in item ? Boolean(item.readonly) : group.future} />
                )}
              </div>
            ))}
          </div>
          {!group.future && (
            <button className="btn-primary text-sm mt-4">Save Settings</button>
          )}
        </div>
      ))}
    </div>
  );
}
