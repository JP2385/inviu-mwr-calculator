# Casos de Prueba - MWR Calculator

Este documento contiene casos de prueba manuales para validar los cálculos del sistema.

## 📋 Tabla de Contenidos
1. [Casos Básicos de MWR](#casos-básicos-de-mwr)
2. [Casos con MEP](#casos-con-mep)
3. [Casos con Inflación](#casos-con-inflación)
4. [Validación de Flujos](#validación-de-flujos)

---

## Casos Básicos de MWR

### ✅ Caso 1: Inversión Simple - 10% Retorno

**Escenario:**
- Depositas $100 el 01/01/2024
- El 31/12/2024 tu portfolio vale $110

**Resultados Esperados:**
- Total Invertido: $100
- Valor Actual: $110
- Ganancia: $10
- Retorno Simple: 10%
- MWR Anualizado: ~10%

**Cómo Verificar:**
1. Sube un Excel con un solo depósito de $100
2. Sube Tenencias con valor total $110
3. Verifica que la ganancia sea $10 y el retorno ~10%

---

### ✅ Caso 2: Múltiples Depósitos

**Escenario:**
- Depositas $100 el 01/01/2024
- Depositas $50 el 01/07/2024
- El 31/12/2024 tu portfolio vale $165

**Resultados Esperados:**
- Total Invertido: $150
- Valor Actual: $165
- Ganancia: $15
- Retorno Simple: 10%

**Validación:**
- La ganancia de $15 sobre $150 invertido = 10% ✓

---

### ✅ Caso 3: Con Retiros

**Escenario:**
- Depositas $1000 el 01/01/2024
- Retiras $200 el 01/07/2024
- El 31/12/2024 tu portfolio vale $880

**Resultados Esperados:**
- Total Invertido: $800 (1000 - 200)
- Valor Actual: $880
- Ganancia: $80
- Retorno Simple: 10%

**Validación:**
- Capital neto = Depósitos - Retiros = $800 ✓
- Ganancia = Valor Final - Capital Neto = $80 ✓
- Retorno = $80 / $800 = 10% ✓

---

### ✅ Caso 4: Pérdida

**Escenario:**
- Depositas $100 el 01/01/2024
- El 31/12/2024 tu portfolio vale $90

**Resultados Esperados:**
- Total Invertido: $100
- Valor Actual: $90
- Ganancia: -$10
- Retorno Simple: -10%

**Validación:**
- El retorno debe ser negativo
- Pérdida de 10% del capital

---

## Casos con MEP

### ✅ Caso 1: Comprar MEP vs Portfolio

**Escenario:**
- Depositas $1,000,000 ARS cuando MEP = $1000
- Eso equivale a USD 1,000
- Después de 1 año:
  - MEP actual = $1500
  - Portfolio = $1,600,000 ARS

**Si hubieras comprado MEP:**
- USD 1,000 × $1500 = $1,500,000 ARS
- Ganancia MEP: $500,000 ARS
- Retorno MEP: 50%

**Tu Portfolio:**
- Valor: $1,600,000 ARS
- Ganancia: $600,000 ARS
- Retorno: 60%

**Comparación:**
- Ventaja Portfolio: $100,000 ARS
- Le ganaste al MEP por 10 puntos porcentuales ✓

---

### ✅ Caso 2: Portfolio en USD

**Escenario:**
- Depósito 1: $1,000,000 ARS @ MEP $1000 = USD 1,000
- Depósito 2: $1,200,000 ARS @ MEP $1200 = USD 1,000
- Total invertido USD: 2,000
- Portfolio actual: $3,300,000 ARS @ MEP $1500 = USD 2,200

**Resultados Esperados:**
- Total Invertido USD: 2,000
- Valor Actual USD: 2,200
- Ganancia USD: 200
- Retorno USD: 10%

**Validación:**
- MWR en USD mide tu rendimiento en poder adquisitivo dolarizado
- Si MWR USD < MWR ARS → Parte de tu ganancia fue solo devaluación

---

## Casos con Inflación

### ✅ Caso 1: Le Ganas a la Inflación

**Escenario:**
- Inversión: $1,000,000
- Inflación del período: 50%
- Portfolio final: $1,700,000

**Cálculos:**
- Valor ajustado inflación: $1,000,000 × 1.5 = $1,500,000
- Pérdida poder adquisitivo: $500,000
- Portfolio: $1,700,000
- Ganancia real: $1,700,000 - $1,500,000 = $200,000 ✓

**Interpretación:**
- Necesitabas $1,500,000 para mantener el mismo poder adquisitivo
- Tenés $1,700,000
- Le ganaste $200,000 a la inflación ✓

---

### ✅ Caso 2: Pierdes contra la Inflación

**Escenario:**
- Inversión: $1,000,000
- Inflación: 100%
- Portfolio final: $1,500,000

**Cálculos:**
- Valor ajustado inflación: $2,000,000
- Portfolio: $1,500,000
- Ganancia real: -$500,000 ✗

**Interpretación:**
- Aunque ganaste $500,000 en pesos nominales
- Perdiste $500,000 en términos reales (poder adquisitivo)

---

### ✅ Caso 3: Inflación Acumulada

**Fórmula:**
```
Inflación Acumulada = [(1 + var1) × (1 + var2) × ... × (1 + varN)] - 1
```

**Ejemplo Argentina 2024 (Ene-Mar):**
- Enero: 20.6%
- Febrero: 13.2%
- Marzo: 11.0%

**Cálculo:**
```
(1.206 × 1.132 × 1.110) - 1 = 1.515 - 1 = 0.515 = 51.5%
```

**Validación:**
- NO es simplemente sumar: 20.6 + 13.2 + 11.0 = 44.8% ✗
- Es compuesta: 51.5% ✓

---

## Validación de Flujos

### ⚠️ CRÍTICO: Solo contar flujos externos

**Deben contarse como cashflows:**
- ✅ Operación = "Depósito" → Dinero que TÚ metiste
- ✅ Operación = "Retiro" → Dinero que TÚ sacaste

**NO deben contarse como cashflows:**
- ❌ Dividendos → Son ganancia interna
- ❌ Rentas → Son ganancia interna
- ❌ Remuneraciones → Son ganancia interna
- ❌ Compra/Venta → Movimientos internos
- ❌ Amortización → Movimiento interno
- ❌ Suscripción → Movimiento interno
- ❌ Rescate → Movimiento interno

**Cómo verificar:**
1. Mira la consola del navegador (F12)
2. Debe decir: "Encontrados X cashflows externos (Depósito/Retiro)"
3. Debe decir: "Excluidos: Amortización, Compra, Venta, Dividendos..."
4. Verifica que X coincida con tus depósitos/retiros reales

---

## 🧪 Ejecutar Tests Automatizados

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests con interfaz visual
npm run test:ui

# Ejecutar tests una sola vez (para CI/CD)
npm run test:run
```

---

## ✅ Checklist de Validación

Antes de confiar en los resultados, verifica:

- [ ] El número de cashflows coincide con tus depósitos/retiros reales
- [ ] No se están contando dividendos/rentas como aportes
- [ ] El total invertido = suma de depósitos - suma de retiros
- [ ] La ganancia = valor actual - total invertido
- [ ] El retorno simple = ganancia / total invertido
- [ ] El MWR USD < MWR ARS si hubo devaluación significativa
- [ ] La inflación acumulada tiene sentido para el período
- [ ] Le ganaste/perdiste a la inflación según lo esperado

---

## 📊 Comparación con Excel XIRR

Para validar el MWR contra Excel:

1. Crea una hoja con tus cashflows:
   ```
   Fecha        | Monto
   01/01/2024   | -100    (depósito)
   01/07/2024   | -50     (depósito)
   31/12/2024   | 165     (valor final)
   ```

2. Usa la fórmula: `=XIRR(rangos_de_montos, rango_de_fechas)`

3. Compara el resultado con el MWR Anualizado de la app
   - Debe coincidir con ±0.5% de tolerancia

---

## 🐛 Reporte de Errores

Si encuentras discrepancias:

1. Anota el caso exacto (fechas, montos)
2. Calcula manualmente el resultado esperado
3. Compara con lo que muestra la app
4. Reporta la diferencia con todos los detalles

---

**Última actualización:** 26/10/2025
