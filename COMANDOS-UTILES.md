# Comandos Útiles - Calculadora MWR Inviu

## 🚀 Comandos Principales

### Instalación
```bash
# Instalar todas las dependencias
npm install

# O con yarn
yarn install
```

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# El servidor se abrirá en http://localhost:5173
# Hot reload automático al editar archivos
```

### Producción
```bash
# Generar build de producción
npm run build

# Preview del build
npm run preview
```

## 🛠️ Comandos de Mantenimiento

### Limpiar caché
```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules
npm install
```

### Actualizar dependencias
```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas las dependencias menores
npm update

# Actualizar dependencia específica
npm install react@latest
```

## 📦 Gestión de Paquetes

### Ver dependencias instaladas
```bash
# Ver todas las dependencias
npm list

# Ver dependencias de primer nivel
npm list --depth=0

# Ver información de un paquete
npm view recharts
```

### Agregar nuevas dependencias
```bash
# Dependencia de producción
npm install nombre-paquete

# Dependencia de desarrollo
npm install -D nombre-paquete

# Versión específica
npm install react@18.2.0
```

## 🔍 Debugging

### Ver información del proyecto
```bash
# Ver versión de Node
node --version

# Ver versión de npm
npm --version

# Ver configuración de npm
npm config list
```

### Resolver problemas comunes
```bash
# Puerto ocupado - usar otro puerto
npm run dev -- --port 3000

# Limpiar caché de Vite
rm -rf .vite

# Rebuild desde cero
rm -rf node_modules dist
npm install
npm run build
```

## 🌐 Deploy

### Deploy en Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Deploy en Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy a producción
netlify deploy --prod
```

### Build local para cualquier hosting
```bash
# Generar archivos estáticos
npm run build

# Los archivos estarán en ./dist
# Subir esa carpeta a tu hosting favorito
```

## 📊 Análisis del Bundle

### Ver tamaño del bundle
```bash
# Build con análisis
npm run build

# El output mostrará el tamaño de cada chunk
```

## 🧪 Testing (para futura implementación)

### Setup de tests
```bash
# Instalar Vitest
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Instalar tipos
npm install -D @types/jest
```

### Ejecutar tests
```bash
# Correr tests
npm test

# Tests en modo watch
npm test -- --watch

# Coverage
npm test -- --coverage
```

## 🎨 Linting y Formato

### Setup de ESLint y Prettier (opcional)
```bash
# Instalar ESLint
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Instalar Prettier
npm install -D prettier eslint-config-prettier eslint-plugin-prettier

# Crear archivo .eslintrc.json
# Crear archivo .prettierrc
```

### Ejecutar linters
```bash
# Ejecutar ESLint
npx eslint src/

# Fix automático
npx eslint src/ --fix

# Ejecutar Prettier
npx prettier --write src/
```

## 📝 Git

### Setup inicial
```bash
# Inicializar Git
git init

# Agregar remote
git remote add origin https://github.com/tu-usuario/inviu-mwr-calculator.git

# Primer commit
git add .
git commit -m "Initial commit: Calculadora MWR completa"
git push -u origin main
```

### Workflow diario
```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "Descripción del cambio"

# Push
git push
```

## 🔧 Personalización

### Cambiar puerto de desarrollo
Editar `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})
```

### Cambiar host (acceso desde red local)
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
```

## 📱 PWA (Progressive Web App)

### Setup básico para PWA
```bash
# Instalar plugin
npm install -D vite-plugin-pwa

# Configurar en vite.config.ts
# Agregar manifest.json
# Agregar service worker
```

## 🐛 Troubleshooting Común

### "Cannot find module"
```bash
npm install
```

### "Port already in use"
```bash
npm run dev -- --port 3001
```

### Build falla
```bash
rm -rf node_modules dist
npm install
npm run build
```

### TypeScript errors
```bash
# Verificar tsconfig.json
# Reinstalar tipos
npm install -D @types/node @types/react @types/react-dom
```

### Vite no actualiza cambios
```bash
# Limpiar caché
rm -rf .vite
npm run dev
```

## 🎯 Snippets Útiles

### Agregar nueva página/ruta
```bash
# Instalar React Router
npm install react-router-dom
npm install -D @types/react-router-dom
```

### Agregar API call
```typescript
// Ya tienes axios instalado
import axios from 'axios';

const fetchData = async () => {
  const response = await axios.get('/api/endpoint');
  return response.data;
};
```

### Agregar nuevo componente
```bash
# Crear archivo en src/components/
touch src/components/NuevoComponente.tsx
```

## 📈 Monitoreo

### Ver uso de recursos durante dev
```bash
# Abrir en navegador
# F12 -> Performance tab
# Lighthouse tab para auditoría
```

## 🌍 Internacionalización (i18n)

### Setup de i18next (opcional)
```bash
npm install react-i18next i18next
```

## 🔐 Variables de Entorno

### Crear archivo .env
```bash
# Crear .env en raíz
touch .env

# Agregar variables (deben empezar con VITE_)
VITE_API_URL=https://api.ejemplo.com
VITE_API_KEY=tu-api-key
```

### Usar en código
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

**Tip:** Guarda este archivo como referencia rápida de comandos útiles.
