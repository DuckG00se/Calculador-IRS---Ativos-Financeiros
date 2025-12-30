
import React from 'react';
import { SimulationResult } from '../types';
import { AlertTriangleIcon } from './Icons';

interface TaxSimulationProps {
    result: SimulationResult;
}

const formatCurrency = (value: number) => value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });

const ResultCard: React.FC<{ title: string; children: React.ReactNode, isRecommended?: boolean }> = ({ title, children, isRecommended }) => (
    <div className={`border rounded-lg shadow-md p-6 relative ${isRecommended ? 'bg-green-50 border-green-400' : 'bg-white'}`}>
        {isRecommended && <span className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Recomendado</span>}
        <h4 className="text-lg font-bold text-brand-blue mb-4">{title}</h4>
        {children}
    </div>
);

const TaxSimulation: React.FC<TaxSimulationProps> = ({ result }) => {
    const isFlatRecommended = result.finalChoice === 'FLAT';
    const isAggregatedRecommended = result.finalChoice === 'AGGREGATED';

    return (
        <div>
            <h3 className="text-2xl font-semibold mb-6 text-brand-blue border-b pb-2">Simulação de Imposto</h3>
            {result.mandatoryAggregation && (
                 <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 text-red-800 rounded-md flex items-start">
                    <AlertTriangleIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold">Englobamento Obrigatório</h4>
                        <p>Foi detetada uma mais-valia de curto prazo (&lt;365 dias) e o seu rendimento coletável (outros rendimentos + mais-valias) excede o limiar. O englobamento é obrigatório.</p>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ResultCard title="Opção 1: Taxa Liberatória (28%)" isRecommended={isFlatRecommended}>
                    <div className="space-y-3 text-sm">
                        <p><strong>Imposto Cat. G (Mais-Valias):</strong> {formatCurrency(result.flatRate.catGTax)}</p>
                        <p><strong>Imposto Cat. E (Dividendos):</strong> {formatCurrency(result.flatRate.catETax)}</p>
                        <p><strong>Crédito Imposto Estrangeiro:</strong> {formatCurrency(-result.dividendResult.totalWithholding)}</p>
                        <hr className="my-2"/>
                        <p className="text-lg font-bold">Total a Pagar: <span className="text-brand-red">{formatCurrency(result.flatRate.finalTax)}</span></p>
                    </div>
                </ResultCard>

                <ResultCard title="Opção 2: Englobamento (Taxas Progressivas)" isRecommended={isAggregatedRecommended}>
                     <div className="space-y-3 text-sm">
                        <p><strong>Rendimento Coletável Total:</strong> {formatCurrency(result.aggregatedRate.totalTaxableIncome)}</p>
                        <p><strong>Coleta (Taxas Progressivas):</strong> {formatCurrency(result.aggregatedRate.progressiveTax)}</p>
                        <p><strong>Taxa Adicional Solidariedade:</strong> {formatCurrency(result.aggregatedRate.solidaritySurcharge)}</p>
                        <p><strong>Crédito Imposto Estrangeiro:</strong> {formatCurrency(-result.aggregatedRate.foreignTaxCreditUsed)}</p>
                        <hr className="my-2"/>
                        <p className="text-lg font-bold">Total a Pagar: <span className="text-brand-red">{formatCurrency(result.aggregatedRate.finalTax)}</span></p>
                    </div>
                </ResultCard>
            </div>

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Detalhe Ganhos de Capital</h4>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                            <tr>
                                <th className="px-4 py-2">Ativo</th>
                                <th className="px-4 py-2">Período (dias)</th>
                                <th className="px-4 py-2">Ganho/Perda Bruto</th>
                                <th className="px-4 py-2">Desconto Retenção</th>
                                <th className="px-4 py-2">Ganho/Perda Líquido</th>
                            </tr>
                        </thead>
                        <tbody>
                        {result.gainsResult.gainEntries.map((entry, index) => (
                            <tr key={index} className="border-b">
                                <td className="px-4 py-2">{entry.asset} ({entry.quantity.toFixed(2)})</td>
                                <td className="px-4 py-2">{entry.holdingPeriodDays}</td>
                                <td className={`px-4 py-2 ${entry.gain >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(entry.gain)}</td>
                                <td className="px-4 py-2">{(entry.holdingDiscount * 100).toFixed(0)}%</td>
                                <td className={`px-4 py-2 font-medium ${entry.taxableGain >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(entry.taxableGain)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TaxSimulation;
