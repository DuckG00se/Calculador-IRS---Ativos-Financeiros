
import { Transaction, Dividend, TransactionType, DividendSource, CapitalGainsResult, DividendTaxResult, SimulationResult, AnnexData, CapitalGainEntry, AnnexGEntry, AnnexJEntry, AnnexEEntry } from '../types';
import { TAX_BRACKETS_2025, SOLIDARITY_SURCHARGE, HOLDING_PERIOD_DISCOUNTS, FLAT_RATE, EU_DIVIDEND_EXCLUSION, MANDATORY_AGGREGATION_THRESHOLD } from '../constants';

const MS_IN_DAY = 1000 * 60 * 60 * 24;

const calculateHoldingPeriodDiscount = (days: number): number => {
    if (days <= 730) return 0;
    const years = days / 365.25;
    if (years <= 5) return HOLDING_PERIOD_DISCOUNTS[0].discount;
    if (years <= 8) return HOLDING_PERIOD_DISCOUNTS[1].discount;
    return HOLDING_PERIOD_DISCOUNTS[2].discount;
};

const calculateProgressiveTax = (taxableIncome: number): { progressiveTax: number; solidaritySurcharge: number } => {
    if (taxableIncome <= 0) return { progressiveTax: 0, solidaritySurcharge: 0 };

    let tax = 0;
    let remainingIncome = taxableIncome;
    let lastLimit = 0;

    for (const bracket of TAX_BRACKETS_2025) {
        if (remainingIncome > 0) {
            const taxableInBracket = Math.min(remainingIncome, bracket.upTo - lastLimit);
            tax += taxableInBracket * bracket.rate;
            remainingIncome -= taxableInBracket;
            lastLimit = bracket.upTo;
        } else {
            break;
        }
    }
    
    // Using the official "coleta parcial" method is more direct
    const bracket = TAX_BRACKETS_2025.find(b => taxableIncome <= b.upTo);
    if(bracket) {
        const baseBracket = TAX_BRACKETS_2025[TAX_BRACKETS_2025.indexOf(bracket) - 1];
        const incomeInBracket = taxableIncome - (baseBracket ? baseBracket.upTo : 0);
        tax = (baseBracket ? baseBracket.base : 0) + incomeInBracket * bracket.rate;
    } else { // Failsafe for the last bracket
        const lastBracket = TAX_BRACKETS_2025[TAX_BRACKETS_2025.length-2];
        tax = lastBracket.base + (taxableIncome - lastBracket.upTo) * TAX_BRACKETS_2025[TAX_BRACKETS_2025.length-1].rate;
    }


    let surcharge = 0;
    if (taxableIncome > SOLIDARITY_SURCHARGE.level1_threshold) {
        const surchargeableIncome = taxableIncome - SOLIDARITY_SURCHARGE.level1_threshold;
        if (taxableIncome > SOLIDARITY_SURCHARGE.level2_threshold) {
            const incomeInLevel1 = SOLIDARITY_SURCHARGE.level2_threshold - SOLIDARITY_SURCHARGE.level1_threshold;
            const incomeInLevel2 = taxableIncome - SOLIDARITY_SURCHARGE.level2_threshold;
            surcharge = (incomeInLevel1 * SOLIDARITY_SURCHARGE.level1_rate) + (incomeInLevel2 * SOLIDARITY_SURCHARGE.level2_rate);
        } else {
            surcharge = surchargeableIncome * SOLIDARITY_SURCHARGE.level1_rate;
        }
    }

    return { progressiveTax: tax, solidaritySurcharge: surcharge };
};

const calculateCapitalGains = (transactions: Transaction[]): CapitalGainsResult => {
    const buys = transactions.filter(t => t.type === TransactionType.BUY).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const sells = transactions.filter(t => t.type === TransactionType.SELL).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const buyQueue: { transaction: Transaction, remainingQty: number }[] = buys.map(t => ({ transaction: t, remainingQty: t.quantity }));
    
    const gainEntries: CapitalGainEntry[] = [];

    for (const sell of sells) {
        let sellQtyToMatch = sell.quantity;
        const sellValuePerUnit = (sell.price * sell.quantity - sell.costs) / sell.quantity;

        for (const buy of buyQueue) {
            if (sellQtyToMatch === 0) break;
            if (buy.remainingQty === 0 || buy.transaction.asset !== sell.asset) continue;

            const matchQty = Math.min(sellQtyToMatch, buy.remainingQty);
            const buyValuePerUnit = (buy.transaction.price * buy.transaction.quantity + buy.transaction.costs) / buy.transaction.quantity;

            const gain = (sellValuePerUnit - buyValuePerUnit) * matchQty;
            
            const sellDate = new Date(sell.date);
            const buyDate = new Date(buy.transaction.date);
            const holdingPeriodDays = Math.round((sellDate.getTime() - buyDate.getTime()) / MS_IN_DAY);

            const holdingDiscount = calculateHoldingPeriodDiscount(holdingPeriodDays);
            const taxableGain = gain > 0 ? gain * (1 - holdingDiscount) : gain;

            gainEntries.push({
                asset: sell.asset,
                buyDate: buy.transaction.date,
                sellDate: sell.date,
                holdingPeriodDays,
                quantity: matchQty,
                buyValue: buyValuePerUnit * matchQty,
                sellValue: sellValuePerUnit * matchQty,
                gain,
                holdingDiscount,
                taxableGain,
                isShortTerm: holdingPeriodDays < 365,
            });

            buy.remainingQty -= matchQty;
            sellQtyToMatch -= matchQty;
        }
    }

    const positiveGains = gainEntries.filter(g => g.gain > 0);
    const totalGains = positiveGains.reduce((acc, g) => acc + g.gain, 0);
    const totalTaxableGains = positiveGains.reduce((acc, g) => acc + g.taxableGain, 0);
    const hasShortTermGains = gainEntries.some(g => g.isShortTerm && g.gain > 0);
    
    // Handle losses
    const totalLosses = gainEntries.filter(g => g.gain < 0).reduce((acc, g) => acc + g.gain, 0);

    return {
        totalGains: totalGains + totalLosses, // Net gain
        totalTaxableGains: totalTaxableGains + totalLosses, // Losses offset taxable gains 1:1
        hasShortTermGains,
        gainEntries,
    };
};

const calculateDividendTax = (dividends: Dividend[]): DividendTaxResult => {
    const totalGross = dividends.reduce((acc, d) => acc + d.grossAmount, 0);
    const totalWithholding = dividends.reduce((acc, d) => acc + d.withholdingTax, 0);
    
    const taxableAmountFlat = totalGross;
    
    const taxableAmountAggregated = dividends.reduce((acc, d) => {
        if (d.source === DividendSource.PT_EU_EEE) {
            return acc + (d.grossAmount * (1 - EU_DIVIDEND_EXCLUSION));
        }
        return acc + d.grossAmount;
    }, 0);

    return { totalGross, totalWithholding, taxableAmountFlat, taxableAmountAggregated };
};

const generateAnnexes = (gainsResult: CapitalGainsResult, dividendResult: DividendTaxResult): AnnexData => {
    const annexG: AnnexGEntry[] = gainsResult.gainEntries.map(g => ({
        year: new Date(g.sellDate).getFullYear().toString(),
        assetType: 'Ações/Obrigações', // Simplified
        valueRealization: g.sellValue,
        valueAcquisition: g.buyValue,
        expenses: 0, // Costs are baked into values
    }));

    const annexJ: AnnexJEntry[] = []; // Assuming all are domestic for simplicity here
    const annexE: AnnexEEntry[] = [];

    if (dividendResult.totalGross > 0) {
        const ptEuDividends = dividendResult.totalGross; // Simplified
        if (ptEuDividends > 0) {
            annexE.push({
                incomeType: 'E20',
                grossIncome: ptEuDividends,
            });
        }
    }
    
    // Note: A real implementation would need country data for Annex J
    return { g: annexG, j: annexJ, e: annexE };
};


export const calculateTaxSimulation = (transactions: Transaction[], dividends: Dividend[], annualIncome: number): { result: SimulationResult, annexes: AnnexData } => {
    const gainsResult = calculateCapitalGains(transactions);
    const dividendResult = calculateDividendTax(dividends);

    const taxableGains = Math.max(0, gainsResult.totalTaxableGains);

    // --- Flat Rate Calculation ---
    const catGTaxFlat = taxableGains * FLAT_RATE;
    const catETaxFlat = dividendResult.taxableAmountFlat * FLAT_RATE;
    const foreignTaxCreditFlat = Math.min(catETaxFlat, dividendResult.totalWithholding);
    const finalTaxFlat = catGTaxFlat + catETaxFlat - foreignTaxCreditFlat;

    // --- Aggregated Rate Calculation ---
    const totalTaxableIncomeForAggregation = annualIncome + taxableGains + dividendResult.taxableAmountAggregated;
    
    const { progressiveTax, solidaritySurcharge } = calculateProgressiveTax(totalTaxableIncomeForAggregation);
    const totalTaxAggregated = progressiveTax + solidaritySurcharge;

    const taxOnAggregatedDividends = calculateProgressiveTax(annualIncome + dividendResult.taxableAmountAggregated).progressiveTax - calculateProgressiveTax(annualIncome).progressiveTax;
    const foreignTaxCreditAggregated = Math.min(taxOnAggregatedDividends, dividendResult.totalWithholding);
    const finalTaxAggregated = totalTaxAggregated - foreignTaxCreditAggregated;

    // --- Mandatory Aggregation Check ---
    const mandatoryAggregation = gainsResult.hasShortTermGains && (annualIncome + gainsResult.totalGains) > MANDATORY_AGGREGATION_THRESHOLD;

    const finalChoice = mandatoryAggregation ? 'AGGREGATED' : (finalTaxFlat < finalTaxAggregated ? 'FLAT' : 'AGGREGATED');

    const result: SimulationResult = {
        flatRate: {
            totalTax: catGTaxFlat + catETaxFlat,
            catGTax: catGTaxFlat,
            catETax: catETaxFlat,
            finalTax: finalTaxFlat,
        },
        aggregatedRate: {
            totalTaxableIncome: totalTaxableIncomeForAggregation,
            progressiveTax,
            solidaritySurcharge,
            totalTax: totalTaxAggregated,
            foreignTaxCreditUsed: foreignTaxCreditAggregated,
            finalTax: finalTaxAggregated,
        },
        mandatoryAggregation,
        finalChoice,
        gainsResult,
        dividendResult,
    };
    
    const annexes = generateAnnexes(gainsResult, dividendResult);

    return { result, annexes };
};
