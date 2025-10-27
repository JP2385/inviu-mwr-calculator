/**
 * Servicio para generar reportes PDF de resultados MWR
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MWRResult } from '../types';

/**
 * Genera un PDF con el reporte completo de MWR
 */
export async function generatePDFReport(result: MWRResult): Promise<void> {
  const doc = new jsPDF();
  let yPosition = 20;

  // Configuración de colores
  const primaryColor = [59, 130, 246]; // blue-600
  const secondaryColor = [107, 114, 128]; // gray-500
  const successColor = [16, 185, 129]; // green-500
  const dangerColor = [239, 68, 68]; // red-500

  // ==================
  // 1. PORTADA
  // ==================
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text('Reporte de Inversión', 105, yPosition, { align: 'center' });

  yPosition += 10;
  doc.setFontSize(16);
  doc.text('Análisis MWR - Money Weighted Return', 105, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  const fechaReporte = new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Generado el ${fechaReporte}`, 105, yPosition, { align: 'center' });

  yPosition += 20;

  // ==================
  // 2. RESUMEN EJECUTIVO
  // ==================
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Resumen Ejecutivo', 20, yPosition);
  yPosition += 8;

  // Tabla de métricas principales
  autoTable(doc, {
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: [
      ['Duración de la Inversión', `${result.duracionAnios.toFixed(2)} años`],
      ['Total Invertido (ARS)', formatARS(result.totalInvertido)],
      ['Valor Actual (ARS)', formatARS(result.valorActual)],
      ['Ganancia/Pérdida (ARS)', formatARS(result.ganancia)],
      ['Retorno Simple', formatPercentage(result.retornoSimple)],
      ['MWR Anualizado (ARS)', formatPercentage(result.mwrAnualizado)],
      ['Retorno Total del Período', formatPercentage(result.mwrTotal)],
    ],
    theme: 'striped',
    headStyles: { fillColor: primaryColor },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ==================
  // 3. MWR EN PESOS VS DÓLARES
  // ==================
  doc.setFontSize(14);
  doc.text('MWR en Pesos vs Dólares', 20, yPosition);
  yPosition += 8;

  autoTable(doc, {
    startY: yPosition,
    head: [['', 'Pesos (ARS)', 'Dólares (USD)']],
    body: [
      [
        'MWR Anualizado',
        formatPercentage(result.mwrAnualizado),
        formatPercentage(result.mwrUSD.mwrAnualizadoUSD)
      ],
      [
        'Retorno Total',
        formatPercentage(result.mwrTotal),
        formatPercentage(result.mwrUSD.mwrTotalUSD)
      ],
      [
        'Total Invertido',
        formatARS(result.totalInvertido),
        `USD ${result.mwrUSD.totalInvertidoUSD.toFixed(2)}`
      ],
      [
        'Valor Actual',
        formatARS(result.valorActual),
        `USD ${result.mwrUSD.valorActualUSD.toFixed(2)}`
      ],
      [
        'Ganancia',
        formatARS(result.ganancia),
        `USD ${result.mwrUSD.gananciaUSD.toFixed(2)}`
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: primaryColor },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ==================
  // 4. COMPARACIÓN CON MEP
  // ==================
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.text('Comparación vs Comprar Dólares MEP', 20, yPosition);
  yPosition += 8;

  const mep = result.mepComparison;
  autoTable(doc, {
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: [
      ['Dólares Comprados (total)', `USD ${mep.totalDolaresComprados.toFixed(2)}`],
      ['Dólares Vendidos (retiros)', `USD ${mep.totalDolaresVendidos.toFixed(2)}`],
      ['Dólares Finales', `USD ${mep.dolaresFinales.toFixed(2)}`],
      ['Valor Final en ARS', formatARS(mep.valorFinalARS)],
      ['Ganancia si hubieras comprado MEP', formatARS(mep.gananciaARS)],
      ['Rendimiento MEP Anualizado', formatPercentage(mep.rendimientoAnualizado)],
      ['Diferencia vs MWR Portfolio', formatPercentage(mep.diferenciaMWR)],
      ['Ventaja del Portfolio', formatARS(mep.ventajaPortfolio)],
    ],
    theme: 'striped',
    headStyles: { fillColor: primaryColor },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ==================
  // 5. COMPARACIÓN CON INFLACIÓN
  // ==================
  if (result.inflacionComparison) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text('Comparación vs Inflación', 20, yPosition);
    yPosition += 5;

    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.text(
      `Período: ${result.inflacionComparison.periodoInicio} a ${result.inflacionComparison.periodoFin}`,
      20,
      yPosition
    );
    doc.setTextColor(0, 0, 0);
    yPosition += 5;

    const inf = result.inflacionComparison;
    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: [
        ['Inflación Acumulada', formatPercentage(inf.inflacionAcumulada)],
        ['Inversión Inicial', formatARS(inf.inversionInicial)],
        ['Valor Ajustado por Inflación', formatARS(inf.valorAjustadoInflacion)],
        ['Pérdida de Poder Adquisitivo', formatARS(inf.perdidaPoderAdquisitivo)],
        ['Ganancia Real vs Inflación', formatARS(inf.gananciaRealVsInflacion)],
        ['Rendimiento Real', formatPercentage(inf.rendimientoRealVsInflacion)],
        ['¿Le ganaste a la inflación?', inf.gananciaRealVsInflacion >= 0 ? 'SÍ ✓' : 'NO ✗'],
      ],
      theme: 'striped',
      headStyles: { fillColor: primaryColor },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ==================
  // 6. FLUJOS DE CAJA
  // ==================
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Detalle de Flujos de Caja', 20, yPosition);
  yPosition += 8;

  // Preparar datos de flujos
  const flowsData = result.cashflows.map(cf => [
    cf.date.toLocaleDateString('es-AR'),
    cf.type === 'deposit' ? 'Depósito' : 'Retiro',
    formatARS(cf.amount),
    cf.mepRate ? `$${cf.mepRate.toFixed(2)}` : '-',
    cf.description.substring(0, 30) + (cf.description.length > 30 ? '...' : ''),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Fecha', 'Tipo', 'Monto (ARS)', 'MEP', 'Descripción']],
    body: flowsData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { cellWidth: 60 },
    },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 8 },
  });

  // ==================
  // PIE DE PÁGINA EN TODAS LAS PÁGINAS
  // ==================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      285,
      { align: 'center' }
    );
    doc.text(
      'Generado con Inviu MWR Calculator',
      105,
      290,
      { align: 'center' }
    );
  }

  // Guardar el PDF
  const fileName = `reporte-mwr-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Helpers de formato
function formatARS(value: number): string {
  return `$${value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}
