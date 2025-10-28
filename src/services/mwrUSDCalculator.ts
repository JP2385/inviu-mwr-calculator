/**
 * MWR calculator in USD
 */

import { daysBetween, yearsBetween } from '../utils/dateUtils';
import type { CashFlow, MWRinUSD } from '../types';

/**
 * Calculate Net Present Value (NPV) for a given rate
 */
function calculateNPV(
  cashflows: CashFlow[],
  finalValue: number,
  rate: number,
  firstDate: Date,
  lastDate: Date
): number {
  let npv = 0;

  // Add all cashflows (negative for deposits, positive for withdrawals)
  for (const cf of cashflows) {
    const days = daysBetween(firstDate, cf.date);
    const years = days / 365;
    const discountFactor = Math.pow(1 + rate, years);
    const presentValue = cf.type === 'deposit' ? -cf.amount : cf.amount;
    npv += presentValue / discountFactor;
  }

  // Add final value (positive)
  const daysToEnd = daysBetween(firstDate, lastDate);
  const yearsToEnd = daysToEnd / 365;
  const discountFactor = Math.pow(1 + rate, yearsToEnd);
  npv += finalValue / discountFactor;

  return npv;
}

/**
 * Calculate derivative of NPV
 */
function calculateNPVDerivative(
  cashflows: CashFlow[],
  finalValue: number,
  rate: number,
  firstDate: Date,
  lastDate: Date
): number {
  let derivative = 0;

  for (const cf of cashflows) {
    const days = daysBetween(firstDate, cf.date);
    const years = days / 365;
    const discountFactor = Math.pow(1 + rate, years + 1);
    const presentValue = cf.type === 'deposit' ? -cf.amount : cf.amount;
    derivative -= (years * presentValue) / discountFactor;
  }

  const daysToEnd = daysBetween(firstDate, lastDate);
  const yearsToEnd = daysToEnd / 365;
  const discountFactor = Math.pow(1 + rate, yearsToEnd + 1);
  derivative -= (yearsToEnd * finalValue) / discountFactor;

  return derivative;
}

/**
 * Calculate MWR using Newton-Raphson method
 */
function calculateMWRNewtonRaphson(
  cashflows: CashFlow[],
  finalValue: number,
  firstDate: Date,
  lastDate: Date,
  maxIterations: number = 100,
  tolerance: number = 0.0000001
): number {
  let rate = 0.1; // Initial guess: 10%

  for (let i = 0; i < maxIterations; i++) {
    const npv = calculateNPV(cashflows, finalValue, rate, firstDate, lastDate);
    const derivative = calculateNPVDerivative(cashflows, finalValue, rate, firstDate, lastDate);

    if (Math.abs(npv) < tolerance) {
      return rate;
    }

    if (derivative === 0) {
      throw new Error('Derivative is zero, cannot continue Newton-Raphson');
    }

    rate = rate - npv / derivative;

    // Prevent unreasonable rates
    if (rate < -0.99) rate = -0.99;
    if (rate > 100) rate = 100;
  }

  return rate;
}

/**
 * Calculate MWR using Bisection method (fallback)
 */
function calculateMWRBisection(
  cashflows: CashFlow[],
  finalValue: number,
  firstDate: Date,
  lastDate: Date,
  maxIterations: number = 1000,
  tolerance: number = 0.0000001
): number {
  let low = -0.99;
  let high = 10.0;

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const npv = calculateNPV(cashflows, finalValue, mid, firstDate, lastDate);

    if (Math.abs(npv) < tolerance) {
      return mid;
    }

    const npvLow = calculateNPV(cashflows, finalValue, low, firstDate, lastDate);

    if ((npvLow < 0 && npv < 0) || (npvLow > 0 && npv > 0)) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
}

/**
 * Calculate MWR in USD (using MEP rates for each cashflow)
 */
export function calculateMWRinUSD(
  cashflows: CashFlow[],
  portfolioValueARS: number,
  currentMEPRate: number,
  firstDate: Date,
  lastDate: Date
): MWRinUSD {
  // Convert portfolio value to USD
  const portfolioValueUSD = portfolioValueARS / currentMEPRate;

  // Convert each cashflow to USD and calculate total invested
  let totalInvertidoUSD = 0;
  const cashflowsUSD: CashFlow[] = cashflows.map(cf => {
    const mepRate = cf.mepRate || currentMEPRate;
    const amountUSD = cf.amount / mepRate;

    if (cf.type === 'deposit') {
      totalInvertidoUSD += amountUSD;
    } else {
      totalInvertidoUSD -= amountUSD;
    }

    return {
      ...cf,
      amount: amountUSD,
    };
  });

  // Calculate MWR using USD values
  let mwrAnualizadoUSD: number;
  try {
    mwrAnualizadoUSD = calculateMWRNewtonRaphson(
      cashflowsUSD,
      portfolioValueUSD,
      firstDate,
      lastDate
    );

    // If result is unreasonable, try bisection method
    if (isNaN(mwrAnualizadoUSD) || Math.abs(mwrAnualizadoUSD) > 100) {
      mwrAnualizadoUSD = calculateMWRBisection(
        cashflowsUSD,
        portfolioValueUSD,
        firstDate,
        lastDate
      );
    }
  } catch (error) {
    mwrAnualizadoUSD = calculateMWRBisection(
      cashflowsUSD,
      portfolioValueUSD,
      firstDate,
      lastDate
    );
  }

  // Calculate simple return in USD
  const gananciaUSD = portfolioValueUSD - totalInvertidoUSD;
  const retornoSimpleUSD = totalInvertidoUSD > 0 ? gananciaUSD / totalInvertidoUSD : 0;
  const mwrTotalUSD = retornoSimpleUSD;

  return {
    mwrAnualizadoUSD,
    mwrTotalUSD,
    totalInvertidoUSD,
    valorActualUSD: portfolioValueUSD,
    gananciaUSD,
    retornoSimpleUSD,
  };
}
