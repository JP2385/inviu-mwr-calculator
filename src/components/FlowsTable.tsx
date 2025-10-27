import { formatDate } from '../utils/dateUtils';
import { formatARS, formatNumber } from '../utils/formatters';
import type { CashFlow } from '../types';

interface FlowsTableProps {
  cashflows: CashFlow[];
}

export default function FlowsTable({ cashflows }: FlowsTableProps) {
  // Sort by date (most recent first)
  const sortedFlows = [...cashflows].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Flujos de Caja
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto Original
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                TC MEP
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto ARS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedFlows.map((flow, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(flow.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      flow.type === 'deposit'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {flow.type === 'deposit' ? 'Depósito' : 'Retiro'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                  {flow.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {flow.originalCurrency && flow.originalAmount
                    ? `${flow.originalCurrency} ${formatNumber(flow.originalAmount, 2)}`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {flow.mepRate ? formatNumber(flow.mepRate, 2) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  {formatARS(flow.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={5} className="px-6 py-4 text-sm font-bold text-gray-900">
                Total Neto
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                {formatARS(
                  sortedFlows.reduce(
                    (sum, flow) =>
                      sum + (flow.type === 'deposit' ? flow.amount : -flow.amount),
                    0
                  )
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Total de operaciones: {cashflows.length} (
        {cashflows.filter((f) => f.type === 'deposit').length} depósitos,{' '}
        {cashflows.filter((f) => f.type === 'withdrawal').length} retiros)
      </div>
    </div>
  );
}
