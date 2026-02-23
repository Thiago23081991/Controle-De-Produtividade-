import React from 'react';
import { ParsedRecord, RecordStatus } from '../types';
import { AlertCircle } from 'lucide-react';

interface Props {
  records: ParsedRecord[];
}

export const IgnoredList: React.FC<Props> = ({ records }) => {
  // Filter for invalid items
  const ignored = records.filter(r => !r.isValid);

  if (ignored.length === 0) return null;

  return (
    <div className="mt-8 border border-red-200 rounded-lg bg-red-50 overflow-hidden">
      <div className="bg-red-100 px-4 py-3 border-b border-red-200 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <h3 className="text-sm font-bold text-red-800">
          Registros Ignorados ({ignored.length})
        </h3>
      </div>
      <div className="max-h-60 overflow-y-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="text-xs text-red-700 uppercase bg-red-100/50 sticky top-0">
            <tr>
              <th className="px-4 py-2">Motivo</th>
              <th className="px-4 py-2">Expert (Identificado)</th>
              <th className="px-4 py-2">Conteúdo Original</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-200">
            {ignored.map((record) => (
              <tr key={record.id} className="hover:bg-red-100/50">
                <td className="px-4 py-2 font-medium text-red-700 whitespace-nowrap">
                  {record.reason}
                </td>
                <td className="px-4 py-2 text-red-800 whitespace-nowrap">
                   {record.expertName}
                </td>
                <td className="px-4 py-2 text-gray-600 font-mono text-xs truncate max-w-md" title={record.originalText}>
                  {record.originalText}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 text-xs text-red-600 bg-red-50 italic border-t border-red-200">
        * Apenas registros com status "FINALIZADO" (ou sinônimos) são contabilizados na matriz.
      </div>
    </div>
  );
};
