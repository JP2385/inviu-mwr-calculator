# 🚀 Guía Paso a Paso para Deployment

## Opción 1: Vercel (La Más Fácil) - 5 minutos

### Requisitos
- Cuenta en GitHub (si no tienes, créala en github.com)
- Cuenta en Vercel (si no tienes, créala en vercel.com usando tu cuenta de GitHub)

### Pasos

#### 1️⃣ Subir el código a GitHub

**a) Crear repositorio en GitHub:**
1. Ve a https://github.com/new
2. Nombre del repositorio: `inviu-mwr-calculator` (o el que prefieras)
3. Privado o Público: como prefieras
4. NO marcar "Add a README"
5. Click en "Create repository"

**b) Subir tu código desde la terminal:**
```bash
# En la carpeta de tu proyecto
cd C:\Users\jpsga\inviu-mwr-calculator

# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Crear primer commit
git commit -m "Initial commit - Inviu MWR Calculator"

# Conectar con GitHub (reemplaza TU-USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU-USUARIO/inviu-mwr-calculator.git

# Subir el código
git branch -M main
git push -u origin main
```

**Nota:** Si te pide usuario y contraseña, necesitarás crear un Personal Access Token en GitHub:
- Ve a: Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate new token → Marca "repo" → Generate
- Copia el token y úsalo como contraseña

#### 2️⃣ Conectar Vercel con GitHub

1. Ve a https://vercel.com/login
2. Inicia sesión con GitHub (o créate una cuenta si no tienes)
3. Click en "Add New..." → "Project"
4. Busca tu repositorio `inviu-mwr-calculator`
5. Click en "Import"

#### 3️⃣ Configurar el Proyecto en Vercel

En la pantalla de configuración:

**Build & Output Settings:**
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

**Environment Variables:**
- No necesitas agregar ninguna por ahora

**Click en "Deploy"**

⏱️ Espera 2-3 minutos mientras Vercel hace el build...

#### 4️⃣ ¡Listo! Tu App Está Online

Vercel te dará una URL como:
```
https://inviu-mwr-calculator-xxxxx.vercel.app
```

✅ **Tu app ya está desplegada y funcionando!**

---

## Opción 2: Actualización Automática de Datos con GitHub Actions

Para que los datos de MEP e IPC se actualicen automáticamente:

#### 1️⃣ Crear el Workflow de GitHub Actions

**a) Crear la carpeta:**
```bash
cd C:\Users\jpsga\inviu-mwr-calculator
mkdir .github
mkdir .github\workflows
```

**b) Crear el archivo `.github/workflows/update-data.yml`:**

Copia y pega este contenido:

```yaml
name: Update Market Data

on:
  schedule:
    # Diario 18:00 Argentina (21:00 UTC)
    - cron: '0 21 * * *'
    # Día 20 de cada mes, 18:00 Argentina
    - cron: '0 21 20 * *'
  workflow_dispatch: # Para ejecutar manualmente

jobs:
  update-data:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Update MEP data
        run: npm run data:update-mep

      - name: Update IPC data (solo día 20)
        if: github.event.schedule == '0 21 20 * *'
        run: npm run data:update-ipc

      - name: Commit and push if changed
        run: |
          git config --global user.name 'github-actions[bot]'
          git config --global user.email 'github-actions[bot]@users.noreply.github.com'
          git add public/data/*.json
          if git diff --staged --quiet; then
            echo "No changes to commit"
          else
            git commit -m "🤖 Update market data - $(date +'%Y-%m-%d %H:%M')"
            git push
          fi
```

#### 2️⃣ Subir el Workflow a GitHub

```bash
git add .github/workflows/update-data.yml
git commit -m "Add automated data updates workflow"
git push
```

#### 3️⃣ Habilitar GitHub Actions

1. Ve a tu repositorio en GitHub
2. Click en "Actions" (arriba)
3. Si te pide habilitar workflows, click en "I understand my workflows, go ahead and enable them"

#### 4️⃣ Probar Manualmente (Opcional)

1. En GitHub, ve a "Actions"
2. Click en "Update Market Data" (en el sidebar izquierdo)
3. Click en "Run workflow" → "Run workflow"
4. Espera 1-2 minutos
5. Verifica que se creó un nuevo commit con los datos actualizados

✅ **¡Listo! Ahora tus datos se actualizarán automáticamente:**
- **MEP**: Todos los días a las 18:00
- **IPC**: Día 20 de cada mes a las 18:00

**Vercel detectará automáticamente los commits y re-desplegará tu app con los datos actualizados**

---

## Opción 3: Netlify (Alternativa a Vercel)

Si prefieres usar Netlify en lugar de Vercel:

1. Ve a https://www.netlify.com/
2. Sign up con GitHub
3. "Add new site" → "Import an existing project"
4. Selecciona tu repositorio
5. Configuración:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

---

## Verificación Post-Deployment

### ✅ Checklist

Una vez desplegada tu app:

1. **Probar la app:**
   - Abre la URL que te dio Vercel/Netlify
   - Sube tus archivos Excel de Inviu
   - Verifica que el cálculo funcione correctamente
   - Prueba el botón "Descargar Reporte PDF" (al final de la página)

2. **Verificar actualización de datos:**
   - Ve a GitHub Actions
   - Verifica que el workflow se ejecute correctamente
   - Revisa los commits automáticos con los datos actualizados

3. **Monitorear errores:**
   - En Vercel: Deployments → Click en el último → "Functions" tab
   - En GitHub: Actions → Click en la última ejecución

---

## Solución de Problemas

### Error: "Command not found: npm"
Asegúrate de tener Node.js instalado:
```bash
node --version
npm --version
```

### Error: "Permission denied" en git push
Necesitas configurar autenticación:
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### Error en GitHub Actions: "API rate limit"
Las APIs públicas tienen límites. Verifica:
- DolarAPI: Sin límites conocidos
- API datos.gob.ar: Puede tener límites temporales

### La app no carga en Vercel
Revisa los logs:
- Vercel Dashboard → Tu proyecto → "Deployments" → Click en el deployment → "Build Logs"

---

## Siguiente Paso Opcional: Dominio Personalizado

Si quieres usar tu propio dominio (ej: `mwr.tudominio.com`):

### En Vercel:
1. Ve a tu proyecto → "Settings" → "Domains"
2. Agrega tu dominio
3. Sigue las instrucciones para configurar el DNS

### En Netlify:
1. Ve a "Domain settings"
2. "Add custom domain"
3. Sigue las instrucciones

---

## Resumen

**Para desplegar tu app:**
```bash
# 1. Subir a GitHub
git add .
git commit -m "Ready for deployment"
git push

# 2. Conectar con Vercel (desde la web)
# → vercel.com → Import project

# 3. Listo! Tu URL: https://tu-proyecto.vercel.app
```

**Para habilitar actualizaciones automáticas:**
```bash
# Crear .github/workflows/update-data.yml
# (copiar el contenido de arriba)

git add .github/
git commit -m "Add automated updates"
git push

# GitHub Actions se encargará del resto
```

---

## 📞 Ayuda Adicional

Si tienes algún problema:

1. **Vercel tiene documentación excelente:**
   - https://vercel.com/docs

2. **GitHub Actions:**
   - https://docs.github.com/en/actions

3. **Logs de errores:**
   - Siempre revisa los logs de build en Vercel
   - Y los logs de ejecución en GitHub Actions

**¡Éxito con el deployment! 🚀**
