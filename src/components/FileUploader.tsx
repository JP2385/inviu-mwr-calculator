import { useCallback, useState } from 'react';
import { validateExcelFile } from '../services/excelProcessor';
import type { FileUploadState } from '../types';

interface FileUploaderProps {
  files: FileUploadState;
  onFilesChange: (files: FileUploadState) => void;
}

export default function FileUploader({ files, onFilesChange }: FileUploaderProps) {
  const [dragOver, setDragOver] = useState<'movimientos' | 'tenencias' | null>(null);
  const [errors, setErrors] = useState<{ movimientos?: string; tenencias?: string }>({});

  const handleFileSelect = useCallback(
    (type: 'movimientos' | 'tenencias', file: File | null) => {
      if (!file) {
        onFilesChange({ ...files, [type]: null });
        setErrors({ ...errors, [type]: undefined });
        return;
      }

      const validation = validateExcelFile(file);
      if (!validation.valid) {
        setErrors({ ...errors, [type]: validation.error });
        return;
      }

      setErrors({ ...errors, [type]: undefined });
      onFilesChange({ ...files, [type]: file });
    },
    [files, errors, onFilesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, type: 'movimientos' | 'tenencias') => {
      e.preventDefault();
      setDragOver(null);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(type, file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent, type: 'movimientos' | 'tenencias') => {
    e.preventDefault();
    setDragOver(type);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(null);
  }, []);

  const renderFileBox = (type: 'movimientos' | 'tenencias', label: string) => {
    const file = files[type];
    const error = errors[type];
    const isDragging = dragOver === type;

    return (
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-400 bg-red-50' : ''}
          ${file ? 'border-green-400 bg-green-50' : ''}
        `}
        onDrop={(e) => handleDrop(e, type)}
        onDragOver={(e) => handleDragOver(e, type)}
        onDragLeave={handleDragLeave}
        onClick={() => {
          const input = document.getElementById(`file-${type}`) as HTMLInputElement;
          input?.click();
        }}
      >
        <input
          id={`file-${type}`}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => handleFileSelect(type, e.target.files?.[0] || null)}
        />

        <div className="space-y-2">
          {file ? (
            <>
              <div className="text-4xl">✅</div>
              <div className="font-semibold text-green-700">{file.name}</div>
              <div className="text-sm text-gray-600">
                {(file.size / 1024).toFixed(0)} KB
              </div>
              <button
                className="mt-2 text-sm text-red-600 hover:text-red-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileSelect(type, null);
                }}
              >
                Eliminar
              </button>
            </>
          ) : (
            <>
              <div className="text-4xl">📁</div>
              <div className="font-semibold text-gray-700">{label}</div>
              <div className="text-sm text-gray-500">
                Arrastra el archivo aquí o haz clic para seleccionar
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Formatos: .xlsx, .xls (máx 10MB)
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-600 font-medium">{error}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Subir Archivos de Inviu
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderFileBox('movimientos', 'Archivo de Movimientos')}
        {renderFileBox('tenencias', 'Archivo de Tenencias')}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Instrucciones:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Descarga los archivos desde Inviu (Movimientos y Tenencias)</li>
          <li>Sube el archivo de Movimientos (debe contener la hoja "-movimientos")</li>
          <li>Sube el archivo de Tenencias (Sheet1 con el formato de Inviu)</li>
          <li>Haz clic en "Calcular MWR" para ver los resultados</li>
        </ol>
      </div>
    </div>
  );
}
