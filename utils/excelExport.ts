import * as XLSX from 'xlsx';
import { ManualEntryData, ExpertInfo } from '../types';

interface ExportOptions {
    data: ManualEntryData;
    expertMap: Record<string, ExpertInfo>;
    viewMode: 'daily' | 'monthly';
    period: string; // e.g., "04/02/2026" or "Fevereiro/2026"
}

export const exportToExcel = ({ data, expertMap, viewMode, period }: ExportOptions) => {
    // 1. Prepare Data ROWS
    const rows = Object.keys(data).sort().map(expertName => {
        const entry = data[expertName];
        const info = expertMap[expertName];

        const tratado = entry.tratado || 0;
        const finalizado = entry.finalizado || 0;
        const total = tratado + finalizado;
        const goal = entry.goal || 0;
        const efficiency = goal > 0 ? (total / goal) : 0;

        return {
            "Expert": expertName,
            "Supervisor": info?.supervisor || 'Geral',
            "Meta": goal,
            "Tratado": tratado,
            "Finalizado": finalizado,
            "Total Produzido": total,
            "Eficiência": efficiency, // Will be formatted as percentage in Excel
            "Observação": entry.observacao || ''
        };
    });

    // 2. Create Search Sheet
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // 3. Configure Column Widths (Optional but good for UX)
    const colWidths = [
        { wch: 25 }, // Expert
        { wch: 15 }, // Supervisor
        { wch: 10 }, // Meta
        { wch: 10 }, // Tratado
        { wch: 10 }, // Finalizado
        { wch: 15 }, // Total
        { wch: 12 }, // Eficiência
        { wch: 40 }, // Observação
    ];
    worksheet['!cols'] = colWidths;

    // 4. Format Percentage Column (Column G is index 6, assuming 0-based index A=0, B=1...)
    // Iterate over rows to set cell format '0%' for Efficiency column
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:H1');
    for (let R = range.s.r + 1; R <= range.e.r; ++R) { // Start from row 1 (skip header)
        const cellRef = XLSX.utils.encode_cell({ r: R, c: 6 }); // Column index 6 is 'Eficiência'
        if (worksheet[cellRef]) {
            worksheet[cellRef].z = '0%';
        }
    }

    // 5. Create Workbook and Append Sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produtividade");

    // 6. Generate File Name
    const cleanPeriod = period.replace(/\//g, '-').replace(/ /g, '_');
    const fileName = `Produtividade_${viewMode === 'daily' ? 'Diaria' : 'Mensal'}_${cleanPeriod}.xlsx`;

    // 7. Write File
    XLSX.writeFile(workbook, fileName);
};
