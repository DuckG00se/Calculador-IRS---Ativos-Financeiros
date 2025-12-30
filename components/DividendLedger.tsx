
import React, { useState } from 'react';
import { Dividend, DividendSource } from '../types';
import { PlusCircleIcon, TrashIcon } from './Icons';

interface DividendLedgerProps {
    dividends: Dividend[];
    setDividends: React.Dispatch<React.SetStateAction<Dividend[]>>;
}

const DividendLedger: React.FC<DividendLedgerProps> = ({ dividends, setDividends }) => {
    const [newDiv, setNewDiv] = useState<Omit<Dividend, 'id'>>({
        asset: '',
        date: new Date().toISOString().split('T')[0],
        grossAmount: 0,
        withholdingTax: 0,
        source: DividendSource.PT_EU_EEE,
        currency: 'EUR',
    });

    const handleAddDividend = () => {
         if (!newDiv.asset || newDiv.grossAmount <= 0) {
            alert('Please fill in the asset and gross amount.');
            return;
        }
        setDividends([...dividends, { ...newDiv, id: new Date().toISOString() + Math.random() }]);
        setNewDiv({
            asset: '',
            date: new Date().toISOString().split('T')[0],
            grossAmount: 0,
            withholdingTax: 0,
            source: DividendSource.PT_EU_EEE,
            currency: 'EUR',
        });
    };

    const handleRemoveDividend = (id: string) => {
        setDividends(dividends.filter(div => div.id !== id));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numericValue = ['grossAmount', 'withholdingTax'].includes(name) ? parseFloat(value) : value;
        setNewDiv({ ...newDiv, [name]: numericValue });
    };

    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-brand-blue">Registo de Dividendos e Juros</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 p-4 border rounded-lg">
                <input type="text" name="asset" placeholder="Ativo (e.g., EDPR)" value={newDiv.asset} onChange={handleInputChange} className="p-2 border rounded-md" />
                <input type="date" name="date" value={newDiv.date} onChange={handleInputChange} className="p-2 border rounded-md" />
                <input type="number" name="grossAmount" placeholder="Valor Bruto (€)" value={newDiv.grossAmount || ''} onChange={handleInputChange} className="p-2 border rounded-md" />
                <input type="number" name="withholdingTax" placeholder="Imposto Retido na Fonte (€)" value={newDiv.withholdingTax || ''} onChange={handleInputChange} className="p-2 border rounded-md" />
                <select name="source" value={newDiv.source} onChange={handleInputChange} className="p-2 border rounded-md">
                    <option value={DividendSource.PT_EU_EEE}>Fonte PT/EU/EEE</option>
                    <option value={DividendSource.OTHER}>Outra Fonte</option>
                </select>
                <div className="lg:col-span-3 flex justify-end">
                    <button onClick={handleAddDividend} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        <PlusCircleIcon className="h-5 w-5 mr-2" />
                        Adicionar Rendimento
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-700">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Ativo</th>
                            <th scope="col" className="px-6 py-3">Data</th>
                            <th scope="col" className="px-6 py-3">Valor Bruto (€)</th>
                            <th scope="col" className="px-6 py-3">Retido na Fonte (€)</th>
                            <th scope="col" className="px-6 py-3">Fonte</th>
                            <th scope="col" className="px-6 py-3">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                         {dividends.map(div => (
                            <tr key={div.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{div.asset}</td>
                                <td className="px-6 py-4">{div.date}</td>
                                <td className="px-6 py-4">{div.grossAmount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</td>
                                <td className="px-6 py-4">{div.withholdingTax.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</td>
                                <td className="px-6 py-4">{div.source === DividendSource.PT_EU_EEE ? 'PT/EU/EEE' : 'Outra'}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleRemoveDividend(div.id)} className="text-red-600 hover:text-red-800">
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {dividends.length === 0 && <p className="text-center text-gray-500 py-8">Nenhum dividendo ou juro adicionado.</p>}
            </div>
        </div>
    );
};

export default DividendLedger;
