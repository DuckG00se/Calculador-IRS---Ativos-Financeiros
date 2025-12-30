
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { PlusCircleIcon, TrashIcon } from './Icons';

interface TransactionLedgerProps {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const TransactionLedger: React.FC<TransactionLedgerProps> = ({ transactions, setTransactions }) => {
    const [newTx, setNewTx] = useState<Omit<Transaction, 'id'>>({
        type: TransactionType.BUY,
        asset: '',
        date: new Date().toISOString().split('T')[0],
        quantity: 0,
        price: 0,
        costs: 0,
        currency: 'EUR',
    });

    const handleAddTransaction = () => {
        if (!newTx.asset || newTx.quantity <= 0 || newTx.price <= 0) {
            alert('Please fill in all required fields for the transaction.');
            return;
        }
        setTransactions([...transactions, { ...newTx, id: new Date().toISOString() + Math.random() }]);
        // Reset form
        setNewTx({
            type: TransactionType.BUY,
            asset: '',
            date: new Date().toISOString().split('T')[0],
            quantity: 0,
            price: 0,
            costs: 0,
            currency: 'EUR',
        });
    };

    const handleRemoveTransaction = (id: string) => {
        setTransactions(transactions.filter(tx => tx.id !== id));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numericValue = ['quantity', 'price', 'costs'].includes(name) ? parseFloat(value) : value;
        setNewTx({ ...newTx, [name]: numericValue });
    };

    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-brand-blue">Registo de Transações (Mais-Valias)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 border rounded-lg">
                <select name="type" value={newTx.type} onChange={handleInputChange} className="p-2 border rounded-md">
                    <option value={TransactionType.BUY}>Compra</option>
                    <option value={TransactionType.SELL}>Venda</option>
                </select>
                <input type="text" name="asset" placeholder="Ativo (e.g., AAPL)" value={newTx.asset} onChange={handleInputChange} className="p-2 border rounded-md" />
                <input type="date" name="date" value={newTx.date} onChange={handleInputChange} className="p-2 border rounded-md" />
                <input type="number" name="quantity" placeholder="Quantidade" value={newTx.quantity || ''} onChange={handleInputChange} className="p-2 border rounded-md" />
                <input type="number" name="price" placeholder="Preço Total" value={newTx.price || ''} onChange={handleInputChange} className="p-2 border rounded-md" />
                <input type="number" name="costs" placeholder="Custos" value={newTx.costs || ''} onChange={handleInputChange} className="p-2 border rounded-md" />
                 <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                    <button onClick={handleAddTransaction} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        <PlusCircleIcon className="h-5 w-5 mr-2" />
                        Adicionar Transação
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Tipo</th>
                            <th scope="col" className="px-6 py-3">Ativo</th>
                            <th scope="col" className="px-6 py-3">Data</th>
                            <th scope="col" className="px-6 py-3">Quantidade</th>
                            <th scope="col" className="px-6 py-3">Preço Total (€)</th>
                            <th scope="col" className="px-6 py-3">Custos (€)</th>
                            <th scope="col" className="px-6 py-3">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => (
                            <tr key={tx.id} className="bg-white border-b hover:bg-gray-50">
                                <td className={`px-6 py-4 font-medium ${tx.type === TransactionType.BUY ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === TransactionType.BUY ? 'Compra' : 'Venda'}
                                </td>
                                <td className="px-6 py-4">{tx.asset}</td>
                                <td className="px-6 py-4">{tx.date}</td>
                                <td className="px-6 py-4">{tx.quantity.toLocaleString()}</td>
                                <td className="px-6 py-4">{tx.price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</td>
                                <td className="px-6 py-4">{tx.costs.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleRemoveTransaction(tx.id)} className="text-red-600 hover:text-red-800">
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {transactions.length === 0 && <p className="text-center text-gray-500 py-8">Nenhuma transação adicionada.</p>}
            </div>
        </div>
    );
};

export default TransactionLedger;
