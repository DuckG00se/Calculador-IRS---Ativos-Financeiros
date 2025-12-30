
// All values in EUR
// Based on OE2025 proposals and current law.
export const TAX_BRACKETS_2025 = [
    { upTo: 16058, rate: 0.17, base: 0 },
    { upTo: 21578, rate: 0.22, base: 2729.86 },
    { upTo: 27146, rate: 0.25, base: 3944.26 },
    { upTo: 38632, rate: 0.32, base: 5621.56 },
    { upTo: 50483, rate: 0.35, base: 9343.43 },
    { upTo: 83696, rate: 0.45, base: 14418.83 },
    { upTo: Infinity, rate: 0.48, base: 29364.68 },
];

export const SOLIDARITY_SURCHARGE = {
    level1_threshold: 80000,
    level1_rate: 0.025,
    level2_threshold: 250000,
    level2_rate: 0.05,
};

// Law 31/2024
export const HOLDING_PERIOD_DISCOUNTS = [
    { years: 2, discount: 0.10 }, // 2 to 5 years (730 to 1825 days)
    { years: 5, discount: 0.20 }, // 5 to 8 years (1826 to 2920 days)
    { years: 8, discount: 0.30 }, // 8+ years (> 2920 days)
];

export const FLAT_RATE = 0.28;
export const EU_DIVIDEND_EXCLUSION = 0.50;
export const MANDATORY_AGGREGATION_THRESHOLD = 83696;
