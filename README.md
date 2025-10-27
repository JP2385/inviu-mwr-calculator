# Calculadora MWR para Inviu

Una aplicación web moderna para calcular el MWR (Money-Weighted Return / Tasa Interna de Retorno) de carteras de inversión de la plataforma Inviu.

## Características

- 📊 Cálculo preciso de MWR usando el método Newton-Raphson
- 📁 Procesamiento de archivos Excel de Inviu (Movimientos y Tenencias)
- 💱 Obtención automática de cotizaciones históricas del dólar MEP
- 📈 Visualizaciones interactivas con gráficos
- 🔒 100% client-side: tus datos nunca salen de tu navegador
- ⚡ Rápido y eficiente
- 📱 Responsive design

## Instalación

### Prerrequisitos

- Node.js 18 o superior
- npm o yarn

### Pasos

1. Clona o descarga este repositorio
2. Instala las dependencias:

```bash
npm install
```

3. Inicia el servidor de desarrollo:

```bash
npm run dev
```

4. Abre tu navegador en `http://localhost:5173`

## Uso

1. **Descarga tus archivos desde Inviu**
   - Archivo de Movimientos (debe contener la hoja "-movimientos")
   - Archivo de Tenencias (Sheet1 con el formato estándar de Inviu)

2. **Sube los archivos**
   - Arrastra y suelta los archivos en las zonas indicadas
   - O haz clic para seleccionar desde tu computadora

3. **Calcula el MWR**
   - Haz clic en "Calcular MWR"
   - Espera unos segundos mientras se procesan los datos

4. **Explora los resultados**
   - Ve tu MWR anualizado y retorno total
   - Analiza la evolución de tu portfolio
   - Revisa la composición de tus inversiones
   - Examina el detalle de tus flujos de caja

## Tecnologías Utilizadas

- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **Recharts** - Gráficos
- **SheetJS (xlsx)** - Procesamiento de Excel
- **date-fns** - Manejo de fechas
- **Axios** - HTTP requests

## Estructura del Proyecto

```
inviu-mwr-calculator/
├── src/
│   ├── components/          # Componentes React
│   │   ├── FileUploader.tsx
│   │   ├── MWRResults.tsx
│   │   ├── PortfolioChart.tsx
│   │   ├── FlowsTable.tsx
│   │   └── LoadingSpinner.tsx
│   ├── services/            # Lógica de negocio
│   │   ├── excelProcessor.ts
│   │   ├── mepAPI.ts
│   │   └── mwrCalculator.ts
│   ├── types/               # Definiciones TypeScript
│   │   └── index.ts
│   ├── utils/               # Utilidades
│   │   ├── dateUtils.ts
│   │   └── formatters.ts
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── public/                  # Archivos estáticos
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## ¿Qué es el MWR?

El **MWR (Money-Weighted Return)** o **Tasa Interna de Retorno (TIR)** es una medida que calcula el rendimiento de una inversión considerando:

- El monto de cada aporte o retiro
- El momento exacto en que se realizó cada operación
- El valor final del portfolio

### Ventajas vs Retorno Simple

**Retorno Simple:**
- Solo compara valor inicial vs final
- No considera cuándo se hicieron aportes

**MWR:**
- Considera el timing de cada peso invertido
- Refleja tu rendimiento real personalizado
- Útil para evaluar decisiones de inversión

### Fórmula

El MWR se calcula resolviendo la ecuación:

```
0 = Σ [Flujo_i / (1 + MWR)^(días_i/365)] + Valor_Final / (1 + MWR)^(días_totales/365)
```

Donde:
- Flujo_i son los depósitos (negativos) y retiros (positivos)
- días_i son los días desde el inicio
- Valor_Final es el valor actual del portfolio

## Cotizaciones del Dólar MEP

La aplicación obtiene cotizaciones históricas del MEP usando:

1. **DolarAPI.com** para cotizaciones actuales
2. **Interpolación lineal** para fechas históricas entre puntos conocidos
3. **Caché local** (localStorage) para optimizar consultas

### Puntos históricos incluidos

- 2024-04-10: $1050
- 2024-04-21: $1122
- 2024-07-02: $1428
- 2024-12-31: $1170
- 2025-03-01: $1200
- 2025-06-01: $1350
- 2025-09-19: $1551
- 2025-10-27: $1549

## Build para Producción

```bash
npm run build
```

Los archivos de producción se generarán en `dist/`

## Deploy

Esta aplicación puede desplegarse en:

- **Vercel** (recomendado)
- **Netlify**
- **GitHub Pages**
- Cualquier hosting de archivos estáticos

### Deploy en Vercel

1. Instala Vercel CLI: `npm i -g vercel`
2. Ejecuta: `vercel`
3. Sigue las instrucciones

### Deploy en Netlify

1. Sube la carpeta `dist/` a Netlify
2. O conecta el repositorio de Git para deploy automático

## Privacidad y Seguridad

- ✅ Todo el procesamiento se hace en tu navegador
- ✅ Tus datos nunca se envían a ningún servidor
- ✅ Los archivos Excel se procesan localmente
- ✅ Las cotizaciones MEP se cachean en localStorage

## Troubleshooting

### Los archivos Excel no se procesan correctamente

Verifica que:
- El archivo de Movimientos tenga una hoja llamada "-movimientos"
- El archivo de Tenencias sea el formato estándar de Inviu
- Los archivos no superen 10MB

### El MWR parece incorrecto

Posibles causas:
- Fechas incorrectas en los movimientos
- Montos en formato no numérico
- Falta información en las tenencias

### Error al obtener cotizaciones MEP

La app usa interpolación como fallback si:
- DolarAPI está caído
- No hay conexión a internet
- Los datos son históricos

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Roadmap

- [ ] Exportar resultados a PDF
- [ ] Exportar resultados a Excel
- [ ] Comparación con benchmarks (Merval, inflación)
- [ ] Análisis por períodos personalizados
- [ ] Soporte para múltiples cuentas
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)

## Licencia

MIT License - Siéntete libre de usar este código

## Soporte

Si encuentras algún bug o tienes sugerencias:
- Abre un issue en GitHub
- Contacta al desarrollador

## Changelog

### v1.0.0 (2024)
- Release inicial
- Cálculo de MWR
- Procesamiento de archivos Excel de Inviu
- Visualizaciones interactivas
- Cotizaciones MEP automáticas

---

**Hecho con ❤️ para inversores de Inviu**
