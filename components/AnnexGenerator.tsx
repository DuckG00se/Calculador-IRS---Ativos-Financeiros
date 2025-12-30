
import React from 'react';
import { AnnexData } from '../types';

interface AnnexGeneratorProps {
    data: AnnexData;
}

const AnnexGenerator: React.FC<AnnexGeneratorProps> = ({ data }) => {
    return (
        <div>
            <h3 className="text-2xl font-semibold mb-6 text-brand-blue border-b pb-2">Gerador de Anexos (Simulado)</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Annex G */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-bold text-lg mb-2">Anexo G - Mais-Valias</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        <code className="whitespace-pre-wrap">
                            {`Quadro 9: Alienação Onerosa de Partes Sociais e Outros Valores Mobiliários\n`}
                            {`------------------------------------------------------------------------\n`}
                            {data.g.length > 0 ? data.g.map((entry, i) => 
`Entrada ${i + 1}:
  Código: G01 - Ações
  Ano Realização: ${entry.year}
  Valor Realização: ${entry.valueRealization.toFixed(2)} EUR
  Ano Aquisição: ${new Date(entry.year).getFullYear()} (FIFO)
  Valor Aquisição: ${entry.valueAcquisition.toFixed(2)} EUR
  Despesas: ${entry.expenses.toFixed(2)} EUR\n`
                            ).join('\n') : 'Nenhuns dados para o Anexo G.'}
                        </code>
                    </pre>
                </div>

                {/* Annex E & J */}
                <div className="space-y-8">
                     <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-bold text-lg mb-2">Anexo E - Rendimentos de Capitais</h4>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                            <code className="whitespace-pre-wrap">
                                {`Quadro 4B: Rendimentos que foram objeto de retenção à taxa liberatória... mas não a título definitivo\n`}
                                {`------------------------------------------------------------------------\n`}
                                {data.e.length > 0 ? data.e.map((entry, i) =>
`Entrada ${i + 1}:
  Código: ${entry.incomeType} - Lucros distribuídos por entidades sujeitas a IRC
  Rendimentos Brutos: ${entry.grossIncome.toFixed(2)} EUR
  Retenções na Fonte: (Verificar extratos)\n`
                                ).join('\n') : 'Nenhuns dados para o Anexo E.'}
                            </code>
                        </pre>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-bold text-lg mb-2">Anexo J - Rendimentos Obtidos no Estrangeiro</h4>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                            <code className="whitespace-pre-wrap">
                                {`Quadro 9.2: Ganhos de Alienação de Partes Sociais (Cat. G)\n`}
                                {`Quadro 8A: Rendimentos de Capitais (Cat. E)\n`}
                                {`------------------------------------------------------------------------\n`}
                                {data.j.length > 0 ? data.j.map((entry, i) =>
`Entrada ${i + 1}:
  País da Fonte: ${entry.country}
  Código Rendimento: ${entry.incomeType}
  Rendimento Bruto: ${entry.grossIncome.toFixed(2)} EUR
  Imposto Pago Estrangeiro: ${entry.taxPaidAbroad.toFixed(2)} EUR\n`
                                ).join('\n') : 'Nenhuns dados para o Anexo J. (Esta versão simplificada assume rendimentos domésticos).'}
                            </code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnexGenerator;
