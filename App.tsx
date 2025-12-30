
import React, { useState, useMemo } from 'react';
import { Transaction, Dividend, SimulationResult, AnnexData, Tab } from './types';
import { calculateTaxSimulation } from './services/taxCalculator';
import TransactionLedger from './components/TransactionLedger';
import DividendLedger from './components/DividendLedger';
import TaxSimulation from './components/TaxSimulation';
import AnnexGenerator from './components/AnnexGenerator';
import { InfoIcon, CalculatorIcon, FileTextIcon, LandmarkIcon } from './components/Icons';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.CAT_G);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [dividends, setDividends] = useState<Dividend[]>([]);
    const [annualIncome, setAnnualIncome] = useState<number>(50000);
    const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
    const [annexData, setAnnexData] = useState<AnnexData | null>(null);

    const handleCalculate = () => {
        const { result, annexes } = calculateTaxSimulation(transactions, dividends, annualIncome);
        setSimulationResult(result);
        setAnnexData(annexes);
        setActiveTab(Tab.SIMULATION);
    };
    
    const tabs = [
        { id: Tab.CAT_G, label: 'Ganhos de Capital (Cat. G)', icon: <LandmarkIcon /> },
        { id: Tab.CAT_E, label: 'Dividendos/Juros (Cat. E)', icon: <FileTextIcon /> },
        { id: Tab.SIMULATION, label: 'Simulação & Anexos', icon: <CalculatorIcon /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 p-6 bg-brand-blue text-white rounded-lg shadow-lg">
                    <h1 className="text-3xl md:text-4xl font-bold">Calculadora de IRS 2024/2025</h1>
                    <p className="mt-2 text-lg text-gray-200">Categorias E (Dividendos/Juros) & G (Ganhos de Capital)</p>
                </header>

                <main className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                     <div className="mb-6 p-4 border-l-4 border-yellow-400 bg-yellow-50 text-yellow-800 rounded-md flex items-start">
                        <InfoIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                        <div>
                           <h4 className="font-bold">Aviso Importante</h4>
                           <p>Esta ferramenta é um simulador e não substitui aconselhamento fiscal profissional. Para transações em moeda estrangeira, utilize as taxas de câmbio do Banco de Portugal para as datas de compra e venda.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                       <div className="lg:col-span-1">
                          <label htmlFor="annualIncome" className="block text-sm font-medium text-gray-700 mb-1">Outros Rendimentos Anuais (Agregados)</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
                            <input
                                type="number"
                                id="annualIncome"
                                value={annualIncome}
                                onChange={(e) => setAnnualIncome(parseFloat(e.target.value) || 0)}
                                className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
                                placeholder="e.g., 50000"
                            />
                          </div>
                       </div>
                    </div>

                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${
                                        activeTab === tab.id
                                            ? 'border-brand-blue text-brand-blue'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
                                >
                                    {React.cloneElement(tab.icon, { className: 'h-5 w-5 mr-2' })}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="transition-all duration-300">
                        {activeTab === Tab.CAT_G && <TransactionLedger transactions={transactions} setTransactions={setTransactions} />}
                        {activeTab === Tab.CAT_E && <DividendLedger dividends={dividends} setDividends={setDividends} />}
                        {activeTab === Tab.SIMULATION && (
                           <>
                           {simulationResult && annexData ? (
                               <div className="space-y-8">
                                   <TaxSimulation result={simulationResult} />
                                   <AnnexGenerator data={annexData} />
                               </div>
                           ) : (
                               <div className="text-center py-12 text-gray-500">
                                   <CalculatorIcon className="h-12 w-12 mx-auto mb-4" />
                                   <p className="text-lg">Preencha os dados nas abas anteriores e clique em "Calcular Imposto" para ver a simulação.</p>
                               </div>
                           )}
                           </>
                        )}
                    </div>
                     <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                        <button
                            onClick={handleCalculate}
                            className="bg-brand-green hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105 flex items-center"
                        >
                            <CalculatorIcon className="h-5 w-5 mr-2" />
                            Calcular Imposto
                        </button>
                    </div>
                </main>
                <footer className="text-center mt-8 text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Calculadora IRS Portugal. Todos os direitos reservados.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
