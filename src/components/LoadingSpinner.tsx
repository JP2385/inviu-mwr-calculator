interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Cargando...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      <p className="mt-4 text-gray-600 text-lg">{message}</p>
    </div>
  );
}
