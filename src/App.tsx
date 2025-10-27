import { useState } from 'react';
import FileUploader from './components/FileUploader';
import LoadingSpinner from './components/LoadingSpinner';
import MWRResults from './components/MWRResults';
import { processMovimientos, processTenencias } from './services/excelProcessor';
import { calculateMWR } from './services/mwrCalculator';
import type { FileUploadState, MWRResult, CashFlow, Portfolio } from './types';

function App() {
  const [files, setFiles] = useState<FileUploadState>({
    movimientos: null,
    tenencias: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MWRResult | null>(null);

  const canCalculate = files.movimientos && files.tenencias;

  const handleCalculate = async () => {
    if (!files.movimientos || !files.tenencias) {
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: Process Movimientos
      setCurrentStep('Procesando archivo de movimientos...');
      const cashflows: CashFlow[] = await processMovimientos(files.movimientos);

      if (cashflows.length === 0) {
        throw new Error('No se encontraron flujos de caja en el archivo de movimientos');
      }

      // Step 2: Process Tenencias
      setCurrentStep('Procesando archivo de tenencias...');
      const portfolio: Portfolio = await processTenencias(files.tenencias);

      if (portfolio.totalValue <= 0) {
        throw new Error('El valor total del portfolio debe ser mayor a cero');
      }

      // Step 3: Calculate MWR
      setCurrentStep('Calculando MWR...');
      const mwrResult = await calculateMWR(cashflows, portfolio);

      setResult(mwrResult);
      setCurrentStep('');
    } catch (err) {
      console.error('Error during calculation:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles({ movimientos: null, tenencias: null });
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="text-4xl">📊</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Calculadora MWR - Inviu
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Calcula el retorno ponderado por dinero de tu cartera de inversiones
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!result ? (
          <div className="space-y-8">
            {/* File Uploader */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <FileUploader files={files} onFilesChange={setFiles} />
            </div>

            {/* Calculate Button */}
            {canCalculate && !isProcessing && (
              <div className="flex justify-center">
                <button
                  onClick={handleCalculate}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🚀 Calcular MWR
                </button>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <LoadingSpinner message={currentStep} />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="text-3xl mr-4">⚠️</div>
                  <div>
                    <h3 className="text-lg font-bold text-red-800 mb-2">
                      Error al procesar
                    </h3>
                    <p className="text-red-700">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                ¿Qué es el MWR?
              </h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 mb-4">
                  El <strong>MWR (Money-Weighted Return)</strong> o{' '}
                  <strong>Tasa Interna de Retorno (TIR)</strong> es una medida
                  precisa de tu rendimiento que considera el timing de tus aportes
                  y retiros.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-bold text-green-900 mb-2">
                      ✅ Ventajas del MWR
                    </h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Considera cuándo invertiste cada peso</li>
                      <li>• Refleja tu rendimiento real personalizado</li>
                      <li>• Útil para comparar distintas estrategias</li>
                      <li>• Estándar de la industria financiera</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-2">
                      📊 Cómo se calcula
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Usa método de Newton-Raphson</li>
                      <li>• Encuentra la tasa que iguala VPN a cero</li>
                      <li>• Considera días exactos entre flujos</li>
                      <li>• Incluye valor final del portfolio</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <MWRResults result={result} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">
            Calculadora MWR para Inviu - Todos los cálculos se realizan localmente
            en tu navegador. Tus datos nunca salen de tu computadora.
          </p>
          <p className="text-center text-gray-500 text-xs mt-2">
            Versión 1.0.0 - Desarrollado con React + TypeScript + Vite
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
