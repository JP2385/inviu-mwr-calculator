# Inicio Rápido - Calculadora MWR Inviu

## Pasos para ejecutar la aplicación

### 1. Instalar dependencias

Abre una terminal en esta carpeta y ejecuta:

```bash
npm install
```

Esto instalará todas las dependencias necesarias (React, TypeScript, TailwindCSS, Recharts, etc.)

### 2. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

### 3. Usar la aplicación

1. Descarga tus archivos desde Inviu:
   - Archivo de Movimientos
   - Archivo de Tenencias

2. Arrastra los archivos a las zonas indicadas o haz clic para seleccionarlos

3. Haz clic en "Calcular MWR"

4. Explora tus resultados

## Comandos disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Genera build de producción
- `npm run preview` - Preview del build de producción

## Estructura de archivos

```
inviu-mwr-calculator/
├── src/
│   ├── components/      # Componentes de UI
│   ├── services/        # Lógica de negocio
│   ├── types/          # Tipos TypeScript
│   ├── utils/          # Funciones auxiliares
│   └── App.tsx         # Aplicación principal
├── public/             # Archivos estáticos
└── README.md           # Documentación completa
```

## Requisitos de los archivos Excel

### Archivo de Movimientos
- Debe tener una hoja llamada "-movimientos"
- Columnas requeridas: Liquidación, Descripción, Monto, Moneda
- Los depósitos deben contener "Recibo de Cobro" en la descripción
- Los retiros deben contener "Comprobante de Pago" en la descripción

### Archivo de Tenencias
- Debe tener Sheet1 con el formato de Inviu
- Fila 3: TC USD MEP
- Fila 4: TC USD CCL
- Desde fila 9: Holdings por tipo de activo

## Troubleshooting

### Error al instalar dependencias
- Asegúrate de tener Node.js 18+ instalado
- Ejecuta `npm cache clean --force` y vuelve a intentar

### Los archivos no se procesan
- Verifica que los archivos sean .xlsx o .xls
- Comprueba que tengan el formato correcto de Inviu
- Máximo 10MB por archivo

### El puerto 5173 está en uso
- Vite automáticamente usará el siguiente puerto disponible
- O puedes especificar uno: `npm run dev -- --port 3000`

## Soporte

Para más información, consulta el README.md completo.
