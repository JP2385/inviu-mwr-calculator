# Actualización de Datos - Guía Rápida

## Comandos Disponibles

### Conversión Inicial (una sola vez)
Convierte `Mep_historico.xlsx` a JSON:
```bash
npm run data:convert
```

### Actualizar MEP (diario)
Obtiene la cotización actual del dólar MEP desde DolarAPI.com:
```bash
npm run data:update-mep
```

### Actualizar IPC (mensual)
Obtiene los últimos datos de inflación desde INDEC:
```bash
npm run data:update-ipc
```

### Actualizar Todo
Ejecuta ambas actualizaciones:
```bash
npm run data:update-all
```

## Archivos de Datos

Los datos se almacenan en:
- **`public/data/mep-historico.json`** - Cotizaciones históricas MEP (381 registros)
- **`public/data/inflacion-historica.json`** - Variación mensual IPC (33 meses)

## APIs Utilizadas

### DolarAPI.com (MEP)
- URL: `https://dolarapi.com/v1/dolares/bolsa`
- Gratuita, sin autenticación
- Actualización: En tiempo real durante horario de mercado

### API Series de Tiempo (IPC)
- URL: `https://apis.datos.gob.ar/series/api/`
- Oficial del gobierno (INDEC)
- Actualización: Mensual (~día 15-20)

## Frecuencia Recomendada

### MEP
**Diario a las 18:00 (UTC-3)**
Después del cierre de mercado.

### IPC
**Mensual, día 20 a las 18:00 (UTC-3)**
Después de que INDEC publique los datos oficiales.

## Deployment

Para configurar actualizaciones automáticas en producción, consulta [DEPLOYMENT.md](./DEPLOYMENT.md).

Opciones disponibles:
- ✅ **GitHub Actions** (recomendado - gratis y simple)
- Vercel Cron Jobs + Blob Storage
- Netlify Scheduled Functions
- Servidor con cron jobs
- Actualización manual

## Verificación

Después de actualizar, verifica los datos:

```bash
# Ver últimas entradas de MEP
node -e "const data = require('./public/data/mep-historico.json'); const keys = Object.keys(data.data).sort(); console.log('Últimos 5 registros MEP:'); keys.slice(-5).forEach(k => console.log(k, data.data[k]))"

# Ver últimas entradas de IPC
node -e "const data = require('./public/data/inflacion-historica.json'); const keys = Object.keys(data.data).sort(); console.log('Últimos 5 meses IPC:'); keys.slice(-5).forEach(k => console.log(k, data.data[k] + '%'))"
```

## Troubleshooting

### Error: "HTTP 502" en IPC
La API del gobierno puede estar temporalmente caída. Reintenta más tarde.

### Error: "File not found" en MEP
Ejecuta primero la conversión inicial:
```bash
npm run data:convert
```

### Los datos no se actualizan en la app
1. Verifica que los archivos JSON se actualizaron correctamente
2. Limpia el caché del navegador (Ctrl+Shift+R)
3. Verifica que la app esté leyendo desde `/data/` y no desde localStorage

## Estado Actual

✅ Archivos JSON generados
✅ Script de actualización MEP funcionando
✅ Script de actualización IPC configurado
⏳ Falta: Configurar schedulers automáticos (ver DEPLOYMENT.md)
