import { Link } from 'react-router-dom';
import { mockTransactions } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import { getGate1Demands } from '../../data/gate1DemandData';
import { getGate1Offers } from '../../data/gate1OfferData';
import { getGate1Transactions } from '../../data/gate1CommerceData';
import { getLiveSelections } from '../../data/gate1FlowData';

export default function AdminMatches() {
  const demands = getGate1Demands();
  const offers = getGate1Offers();
  const selections = getLiveSelections();
  const transactions = getGate1Transactions();

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Selections & Commitments</h1>
          <p className="mt-1 text-sm text-gray-500">Gate 1 separates Buyer Selection, temporary reservation, Mutual Commitment, and Transaction. Legacy Match records are historical only.</p>
        </div>
      </div>

      <section className="card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Buyer Selections / Reservations</h2>
            <p className="mt-1 text-xs text-gray-500">Pending, negotiating, committed, released, and expired allocations remain auditable.</p>
          </div>
          <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-800">{selections.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Selection', 'Demand / Crop', 'Supplier', 'Selected Qty', 'Offer Version', 'Reservation Expires', 'Status', ''].map(header => (
                  <th key={header} className="whitespace-nowrap px-2 py-3 text-left text-xs font-semibold text-gray-500">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selections.map(selection => {
                const demand = demands.find(item => item.id === selection.demandId);
                const offer = offers.find(item => item.id === selection.offerId);
                const transaction = transactions.find(item => item.selectionId === selection.id);
                return (
                  <tr key={selection.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-2 py-3 text-xs font-mono text-gray-400">{selection.id}</td>
                    <td className="px-2 py-3 text-xs"><div className="font-medium text-gray-900">{demand?.cropName ?? selection.demandId}</div><div className="text-gray-400">{selection.demandId}</div></td>
                    <td className="px-2 py-3 text-xs text-gray-700">{offer?.supplierName ?? selection.supplierId}</td>
                    <td className="px-2 py-3 text-xs font-semibold text-gray-900">{selection.selectedQuantity.toLocaleString()} {selection.unit}</td>
                    <td className="px-2 py-3 text-xs text-gray-600">v{selection.offerVersionNumber}</td>
                    <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-600">{new Date(selection.reservationExpiresAt).toLocaleString()}</td>
                    <td className="px-2 py-3"><StatusBadge status={selection.status} /></td>
                    <td className="px-2 py-3 text-xs">{transaction ? <Link to={`/gate1-transactions/${transaction.id}`} className="text-green-600 hover:underline">Transaction</Link> : selection.negotiationThreadId ? <Link to={`/negotiations/${selection.negotiationThreadId}`} className="text-green-600 hover:underline">Negotiation</Link> : '—'}</td>
                  </tr>
                );
              })}
              {selections.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-400">No Gate 1 Selections yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Mutual Commitments / Gate 1 Transactions</h2>
            <p className="mt-1 text-xs text-gray-500">Committed Value and Final Value are intentionally distinct. Payment and Success-Based Platform Fee workflows remain outside Gate 1 Chunks 1–6.</p>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">{transactions.length} transactions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">{['Reference', 'Crop', 'Buyer', 'Supplier', 'Historical Committed', 'Committed Value', 'Final Value', 'Status', ''].map(header => <th key={header} className="whitespace-nowrap px-2 py-3 text-left text-xs font-semibold text-gray-500">{header}</th>)}</tr></thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-2 py-3 text-xs font-mono text-gray-500">{transaction.transactionReference}</td>
                  <td className="px-2 py-3 text-xs font-medium text-gray-900">{transaction.finalTerms.cropName}</td>
                  <td className="px-2 py-3 text-xs text-gray-600">{transaction.finalTerms.buyerName}</td>
                  <td className="px-2 py-3 text-xs text-gray-600">{transaction.finalTerms.supplierName}</td>
                  <td className="px-2 py-3 text-xs font-semibold text-gray-900">{transaction.historicalCommittedQuantity.toLocaleString()} {transaction.finalTerms.unit}</td>
                  <td className="px-2 py-3 text-xs font-semibold text-gray-900">₱{transaction.committedTransactionValue.toLocaleString()}</td>
                  <td className="px-2 py-3 text-xs font-semibold text-green-700">₱{transaction.finalTransactionValue.toLocaleString()}</td>
                  <td className="px-2 py-3"><StatusBadge status={transaction.status} /></td>
                  <td className="px-2 py-3"><Link to={`/gate1-transactions/${transaction.id}`} className="text-xs text-green-600 hover:underline">View</Link></td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan={9} className="px-3 py-8 text-center text-sm text-gray-400">No Mutual Commitments yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card border-dashed opacity-80">
        <h2 className="section-title mb-2 text-gray-600">Legacy Match Records — historical prototype only</h2>
        <p className="mb-4 text-xs text-gray-500">These records predate the Gate 1 rebaseline. Their legacy total/payment/fee fields are not authoritative for the Expanded MVP.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">{['Legacy Transaction', 'Crop', 'Buyer', 'Supplier', 'Legacy Total', 'Matched Date', 'Status', ''].map(header => <th key={header} className="whitespace-nowrap px-2 py-3 text-left text-xs font-semibold text-gray-500">{header}</th>)}</tr></thead>
            <tbody>{mockTransactions.map(transaction => <tr key={transaction.id} className="border-b border-gray-50"><td className="px-2 py-3 text-xs font-mono text-gray-400">{transaction.id}</td><td className="px-2 py-3 text-xs font-medium text-gray-800">{transaction.cropName}</td><td className="px-2 py-3 text-xs text-gray-500">{transaction.buyerName}</td><td className="px-2 py-3 text-xs text-gray-500">{transaction.supplierName}</td><td className="px-2 py-3 text-xs text-gray-600">₱{transaction.totalAmount.toLocaleString()}</td><td className="px-2 py-3 text-xs text-gray-500">{transaction.matchedAt}</td><td className="px-2 py-3"><StatusBadge status={transaction.status} /></td><td className="px-2 py-3"><Link to={`/transactions/${transaction.id}`} className="text-xs text-gray-500 hover:underline">Historical view</Link></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
