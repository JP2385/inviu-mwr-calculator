import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCompact, formatARS, formatUSD } from '../utils/formatters';
import { formatDateShort } from '../utils/dateUtils';
import type { MWRResult, ChartDataPoint } from '../types';
import { generatePortfolioEvolution } from '../services/mwrCalculator';

interface PortfolioChartProps {
  result: MWRResult;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function PortfolioChart({ result }: PortfolioChartProps) {
  const [evolutionData, setEvolutionData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUSD, setShowUSD] = useState(false);

  // Load evolution data
  useEffect(() => {
    async function loadEvolutionData() {
      setIsLoading(true);
      try {
        const data = await generatePortfolioEvolution(
          result.cashflows,
          result.valorActual,
          result.mwrAnualizado,
          result.portfolio.mepRate
        );
        setEvolutionData(data);
      } catch (error) {
        console.error('Error generating evolution data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvolutionData();
  }, [result]);

  // Prepare portfolio composition data
  const compositionData: { [key: string]: number } = {};

  for (const holding of result.portfolio.holdings) {
    if (compositionData[holding.tipo]) {
      compositionData[holding.tipo] += holding.valorTotal;
    } else {
      compositionData[holding.tipo] = holding.valorTotal;
    }
  }

  const pieData = Object.entries(compositionData).map(([name, value]) => ({
    name,
    value,
    percentage: (value / result.valorActual) * 100,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            {new Date(data.date).toLocaleDateString('es-AR')}
          </p>
          <p className="text-lg font-bold text-blue-600">
            {formatARS(data.value)}
          </p>
          <p className="text-sm font-semibold text-green-700">
            {formatUSD(data.valueUSD)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            MEP: ${data.mepRate.toFixed(2)}
          </p>
          {data.deposits && (
            <p className="text-sm text-green-600 mt-2 pt-2 border-t">
              Depósito: {formatARS(data.deposits)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {formatARS(payload[0].value)}
          </p>
          <p className="text-sm text-blue-600">
            {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Evolution Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Evolución del Portfolio
          </h3>

          {/* Toggle ARS/USD */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowUSD(false)}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                !showUSD
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ARS
            </button>
            <button
              onClick={() => setShowUSD(true)}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                showUSD
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              USD
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-gray-500">Cargando gráfico...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={evolutionData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={showUSD ? "#10B981" : "#3B82F6"} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={showUSD ? "#10B981" : "#3B82F6"} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => formatDateShort(new Date(date))}
              />
              <YAxis
                tickFormatter={(value) =>
                  showUSD
                    ? `USD ${(value / 1000).toFixed(0)}K`
                    : formatCompact(value)
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={showUSD ? "valueUSD" : "value"}
                stroke={showUSD ? "#10B981" : "#3B82F6"}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 flex items-center justify-between text-sm">
          <div className={`font-semibold ${showUSD ? 'text-green-700' : 'text-blue-700'}`}>
            {showUSD ? (
              <>Valor en dólares MEP - Muestra el poder adquisitivo en USD</>
            ) : (
              <>Valor en pesos argentinos</>
            )}
          </div>
          {evolutionData.length > 0 && (
            <div className="text-gray-600">
              {evolutionData.length} puntos de datos
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Composition */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Composición del Portfolio
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) =>
                  `${name}: ${percentage.toFixed(1)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend and Values */}
          <div className="space-y-3">
            {pieData.map((entry, index) => (
              <div
                key={entry.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-gray-700">
                    {entry.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {formatARS(entry.value)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {entry.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Holdings */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-700 mb-3">
            Top 10 Holdings
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Ticker
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Cantidad
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Valor
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.portfolio.holdings
                  .sort((a, b) => b.valorTotal - a.valorTotal)
                  .slice(0, 10)
                  .map((holding, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        {holding.ticker}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">
                        {holding.nombre}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {holding.tipo}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">
                        {holding.cantidad.toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                        {formatARS(holding.valorTotal)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 text-right">
                        {((holding.valorTotal / result.valorActual) * 100).toFixed(
                          1
                        )}
                        %
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
