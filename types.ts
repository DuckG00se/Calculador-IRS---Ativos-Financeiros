
export enum TransactionType {
    BUY = 'BUY',
    SELL = 'SELL',
}

export interface Transaction {
    id: string;
    type: TransactionType;
    asset: string;
    date: string;
    quantity: number;
    price: number;
    costs: number;
    currency: string;
}

export enum DividendSource {
    PT_EU_EEE = 'PT_EU_EEE',
    OTHER = 'OTHER',
}

export interface Dividend {
    id: string;
    asset: string;
    date: string;
    grossAmount: number;
    withholdingTax: number;
    source: DividendSource;
    currency: string;
}

export interface CapitalGainEntry {
    asset: string;
    buyDate: string;
    sellDate: string;
    holdingPeriodDays: number;
    quantity: number;
    buyValue: number;
    sellValue: number;
    gain: number;
    holdingDiscount: number;
    taxableGain: number;
    isShortTerm: boolean;
}

export interface CapitalGainsResult {
    totalGains: number;
    totalTaxableGains: number;
    hasShortTermGains: boolean;
    gainEntries: CapitalGainEntry[];
}

export interface DividendTaxResult {
    totalGross: number;
    totalWithholding: number;
    taxableAmountFlat: number;
    taxableAmountAggregated: number;
}

export interface SimulationResult {
    flatRate: {
        totalTax: number;
        catGTax: number;
        catETax: number;
        finalTax: number;
    };
    aggregatedRate: {
        totalTaxableIncome: number;
        progressiveTax: number;
        solidaritySurcharge: number;
        totalTax: number;
        foreignTaxCreditUsed: number;
        finalTax: number;
    };
    mandatoryAggregation: boolean;
    finalChoice: 'FLAT' | 'AGGREGATED';
    gainsResult: CapitalGainsResult;
    dividendResult: DividendTaxResult;
}

export interface AnnexGEntry {
    year: string;
    assetType: string;
    valueRealization: number;
    valueAcquisition: number;
    expenses: number;
}

export interface AnnexJEntry {
    country: string;
    incomeType: string; // e.g., 'G01' for gains, 'E11' for interest, 'E21' for dividends
    grossIncome: number;
    taxPaidAbroad: number;
}

export interface AnnexEEntry {
    incomeType: string; // e.g., 'E20' for PT/EU dividends
    grossIncome: number;
}


export interface AnnexData {
    g: AnnexGEntry[];
    j: AnnexJEntry[];
    e: AnnexEEntry[];
}

export enum Tab {
    CAT_G = 'CAT_G',
    CAT_E = 'CAT_E',
    SIMULATION = 'SIMULATION',
}
