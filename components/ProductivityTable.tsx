import React from 'react';
import { MatrixData, TimeSlot } from '../types';
import { Copy, BarChart } from 'lucide-react';

interface Props {
  matrix: MatrixData;
  markdown: string;
}

export const ProductivityTable: React.FC<Props> = ({ matrix, markdown }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    alert('Tabela Markdown copiada!');
  };

  const experts = Object.keys(matrix).sort();
  const timeSlots = Object.values(TimeSlot);

  if (experts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <BarChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Nenhum registro finalizado encontrado para gerar a matriz.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart className="w-5 h-5 text-indigo-600" />
          Matriz de Produtividade
        </h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copiar Markdown
        </button>
      </div>

      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Expert
              </th>
              {timeSlots.map(slot => (
                <th key={slot} scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                  {slot}
                </th>
              ))}
              <th scope="col" className="px-3 py-3.5 text-center text-sm font-bold text-gray-900 bg-gray-100">
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {experts.map((expert) => {
              const rowTotal = timeSlots.reduce((acc, slot) => acc + matrix[expert][slot], 0);
              return (
                <tr key={expert} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {expert}
                  </td>
                  {timeSlots.map(slot => (
                    <td key={slot} className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
                      {matrix[expert][slot] > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs">
                          {matrix[expert][slot]}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center font-bold text-gray-900 bg-gray-50">
                    {rowTotal}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-100">
             <tr>
                <td className="py-3.5 pl-4 pr-3 text-left text-sm font-bold text-gray-900 sm:pl-6">TOTAL GERAL</td>
                {timeSlots.map(slot => {
                    const colTotal = experts.reduce((acc, expert) => acc + matrix[expert][slot], 0);
                    return (
                        <td key={slot} className="px-3 py-3.5 text-center text-sm font-bold text-gray-900">
                            {colTotal}
                        </td>
                    )
                })}
                <td className="px-3 py-3.5 text-center text-sm font-bold text-indigo-600">
                    {experts.reduce((acc, expert) => acc + timeSlots.reduce((t, s) => t + matrix[expert][s], 0), 0)}
                </td>
             </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
