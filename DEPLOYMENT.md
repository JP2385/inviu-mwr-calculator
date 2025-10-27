# Guía de Deployment - Inviu MWR Calculator

Esta guía explica cómo desplegar la aplicación con actualización automática de datos de MEP e IPC.

## Arquitectura de Datos

La aplicación utiliza dos archivos JSON para almacenar datos históricos:

- **`public/data/mep-historico.json`**: Cotizaciones históricas del dólar MEP
- **`public/data/inflacion-historica.json`**: Variación mensual del IPC (INDEC)

## APIs Utilizadas

### 1. DolarAPI.com (MEP)
- **URL**: `https://dolarapi.com/v1/dolares/bolsa`
- **Tipo**: Pública, sin autenticación
- **Frecuencia**: Actualizaciones en tiempo real durante horario de mercado
- **Documentación**: https://dolarapi.com/docs/

### 2. API de Series de Tiempo (IPC)
- **URL**: `https://apis.datos.gob.ar/series/api/`
- **Serie**: `103.1_I2N_2016_M_19` (Variación mensual del IPC)
- **Tipo**: Pública, sin autenticación
- **Frecuencia**: INDEC publica datos mensuales (~día 15-20 de cada mes)
- **Documentación**: https://datosgobar.github.io/series-tiempo-ar-api/

## Scripts de Actualización

### Conversión Inicial
Para generar los archivos JSON iniciales desde el Excel:

```bash
node scripts/convertMepToJson.cjs
```

### Actualización de MEP (Diaria)
```bash
node scripts/updateMEP.cjs
```

**Ejecutar diariamente a las 18:00 UTC-3** (después del cierre de mercado).

Este script:
1. Consulta DolarAPI.com
2. Obtiene la cotización del día
3. Actualiza `public/data/mep-historico.json`
4. Agrega o actualiza el registro del día actual

### Actualización de IPC (Mensual)
```bash
node scripts/updateIPC.cjs
```

**Ejecutar mensualmente el día 20 a las 18:00 UTC-3** (después de publicación INDEC).

Este script:
1. Consulta la API de Series de Tiempo
2. Obtiene los últimos 12 meses de IPC
3. Actualiza `public/data/inflacion-historica.json`
4. Agrega nuevos meses y actualiza correcciones

## Opciones de Deployment

### Opción 1: Vercel (Recomendada)

Vercel ofrece Vercel Cron Jobs para ejecutar tareas programadas.

#### Setup:

1. **Instalar Vercel CLI**:
```bash
npm i -g vercel
```

2. **Crear archivo `vercel.json`**:
```json
{
  "crons": [
    {
      "path": "/api/update-mep",
      "schedule": "0 21 * * *"
    },
    {
      "path": "/api/update-ipc",
      "schedule": "0 21 20 * *"
    }
  ]
}
```

3. **Crear endpoints API**:

**`api/update-mep.js`**:
```javascript
const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  // Implementar lógica de updateMEP.cjs
  // Escribir a /tmp y luego subir a storage persistente
  // O usar Vercel Blob Storage
  res.status(200).json({ success: true });
}
```

4. **Deploy**:
```bash
vercel --prod
```

**Limitaciones**:
- Los archivos escritos en `/public` no persisten entre builds
- **Solución**: Usar [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob) o base de datos

### Opción 2: Netlify

Similar a Vercel, usa Netlify Functions + Netlify Scheduled Functions.

#### Setup:

1. **Crear `netlify.toml`**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[plugins]]
  package = "@netlify/plugin-scheduled-functions"

  [plugins.inputs]
    [plugins.inputs.schedule]
      # Diario 18:00 UTC-3 (21:00 UTC)
      updateMEP = "0 21 * * *"
      # Día 20 de cada mes, 18:00 UTC-3
      updateIPC = "0 21 20 * *"
```

2. **Crear funciones en `netlify/functions/`**

**Limitación**: Igual que Vercel, necesitas storage persistente.

### Opción 3: GitHub Actions + GitHub Pages

Actualización automática mediante GitHub Actions que commit directamente al repo.

#### Setup:

**`.github/workflows/update-data.yml`**:
```yaml
name: Update Market Data

on:
  schedule:
    # Diario 18:00 UTC-3 (21:00 UTC)
    - cron: '0 21 * * *'
    # Día 20 de cada mes, 18:00 UTC-3
    - cron: '0 21 20 * *'
  workflow_dispatch: # Manual trigger

jobs:
  update-mep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Update MEP data
        run: node scripts/updateMEP.cjs

      - name: Update IPC data (solo día 20)
        if: github.event.schedule == '0 21 20 * *'
        run: node scripts/updateIPC.cjs

      - name: Commit and push if changed
        run: |
          git config --global user.name 'GitHub Actions'
          git config --global user.email 'actions@github.com'
          git add public/data/*.json
          git diff --quiet && git diff --staged --quiet || (git commit -m "🤖 Update market data $(date +'%Y-%m-%d')" && git push)
```

**Ventajas**:
- ✅ Persistencia nativa (commit al repo)
- ✅ Gratis para repositorios públicos
- ✅ No requiere storage externo

**Desventajas**:
- Commits automáticos ensucian el historial
- No recomendado para repos privados (minutos limitados)

### Opción 4: Servidor Tradicional (VPS/Cloud)

Usar cron jobs en un servidor Linux.

#### Setup:

1. **Clonar el repositorio**:
```bash
git clone https://github.com/tu-usuario/inviu-mwr-calculator.git
cd inviu-mwr-calculator
npm install
```

2. **Editar crontab**:
```bash
crontab -e
```

3. **Agregar cron jobs** (ajustar zona horaria):
```cron
# MEP diario 18:00 Argentina (UTC-3)
0 21 * * * cd /path/to/inviu-mwr-calculator && node scripts/updateMEP.cjs >> /var/log/mep-update.log 2>&1

# IPC mensual día 20, 18:00 Argentina
0 21 20 * * cd /path/to/inviu-mwr-calculator && node scripts/updateIPC.cjs >> /var/log/ipc-update.log 2>&1
```

4. **Servir la app con Nginx o Apache**

**Ventajas**:
- ✅ Control total
- ✅ Persistencia garantizada

**Desventajas**:
- Requiere mantener servidor
- Costos de hosting

### Opción 5: Actualización Manual

Si prefieres no automatizar:

1. Ejecutar manualmente cada script cuando necesites actualizar:
```bash
node scripts/updateMEP.cjs
node scripts/updateIPC.cjs
```

2. Commit y push de los cambios:
```bash
git add public/data/*.json
git commit -m "Update data $(date +'%Y-%m-%d')"
git push
```

## Servicios Frontend

Los siguientes servicios están disponibles desde el navegador:

### `mepUpdater.ts`
```typescript
import { getCurrentMEP, loadMEPHistoricalJSON } from '@/services/mepUpdater';

// Obtener cotización actual
const { venta, fecha } = await getCurrentMEP();

// Cargar datos históricos
const historicalData = await loadMEPHistoricalJSON();
```

### `ipcUpdater.ts`
```typescript
import { getIPCFromAPI, loadIPCHistoricalJSON } from '@/services/ipcUpdater';

// Obtener últimos meses de IPC
const ipcData = await getIPCFromAPI('2024-01');

// Cargar datos históricos
const historicalData = await loadIPCHistoricalJSON();
```

## Recomendación Final

Para tu caso de uso, **recomiendo GitHub Actions + GitHub Pages** porque:

1. ✅ Es completamente gratis
2. ✅ Los commits automáticos son perfectos para datos históricos
3. ✅ No requiere configuración de storage externo
4. ✅ Puedes ver el historial de actualizaciones en el repo
5. ✅ Deploy automático en cada commit

Si quieres evitar commits automáticos, usa **Vercel + Vercel Blob Storage**.

## Testing

Para probar los scripts localmente:

```bash
# Convertir Excel inicial
node scripts/convertMepToJson.cjs

# Actualizar MEP
node scripts/updateMEP.cjs

# Actualizar IPC
node scripts/updateIPC.cjs

# Verificar archivos generados
cat public/data/mep-historico.json
cat public/data/inflacion-historica.json
```

## Troubleshooting

### La API de DolarAPI no responde
- Verifica que la URL esté correcta
- Revisa el status de la API en su documentación
- Usa un fallback o reintenta después de un timeout

### La API de Series de Tiempo devuelve 502
- La API del gobierno puede estar temporalmente caída
- El script maneja el error y mantiene los datos existentes
- Reintenta en la próxima ejecución programada

### Los datos no se persisten en Vercel/Netlify
- Implementa Vercel Blob Storage o Netlify Blob
- Alternativa: Usa GitHub Actions para commit directo al repo
- Alternativa: Guarda en una base de datos (Supabase, MongoDB Atlas)

## Próximos Pasos

1. Elegir opción de deployment (recomiendo GitHub Actions)
2. Configurar workflows o cron jobs
3. Probar ejecución manual
4. Verificar que los datos se actualicen correctamente
5. Monitorear logs de ejecución

¡Listo para producción! 🚀
