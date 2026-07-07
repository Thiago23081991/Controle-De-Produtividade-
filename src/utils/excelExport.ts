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

export const exportErrosToExcel = (erros: any[], periodLabel: string) => {
    const rows = erros.map(e => {
        let formattedDate = e.date;
        if (e.date && e.date.includes('-')) {
            const parts = e.date.split('-');
            if (parts.length === 3) {
                formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
        }
        return {
            "Data": formattedDate,
            "Número do Caso / Atividade": e.numero_caso,
            "Expert que Errou": e.expert_name,
            "Motivo": e.motivo || '',
            "Submotivo": e.submotivo || '',
            "Onde está o erro no script": e.descricao_erro,
            "Registrado Por": e.registrado_por || ''
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    
    worksheet['!cols'] = [
        { wch: 15 }, // Data
        { wch: 25 }, // Número do Caso
        { wch: 30 }, // Expert que Errou
        { wch: 20 }, // Motivo
        { wch: 25 }, // Submotivo
        { wch: 55 }, // Onde está o erro no script
        { wch: 30 }, // Registrado Por
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatorio de Erros");

    const cleanPeriod = periodLabel.replace(/\//g, '-').replace(/ /g, '_');
    const fileName = `Relatorio_Erros_${cleanPeriod}.xlsx`;

    XLSX.writeFile(workbook, fileName);
};

export const exportCasosBR01ToExcel = (cases: any[]) => {
    const rows = cases.map(c => {
        const dataFormatada = (c.saved_at || c.savedAt)
            ? (c.saved_at || c.savedAt).split('-').reverse().join('/')
            : '';

        // Monta uma string única com todos os produtos: "Produto A (2un), Produto B (5un)"
        const produtosStr = (c.produtos && c.produtos.length > 0)
            ? c.produtos
                .filter((p: any) => p.nome?.trim())
                .map((p: any) => {
                    const qtd = p.quantidade !== '' ? p.quantidade : '0';
                    return `${p.nome} (${qtd}un)`;
                })
                .join(', ')
            : '';

        return {
            "Data":               dataFormatada,
            "Número do Caso":     c.numero_caso || c.numeroCaso || '',
            "Testou em BR0Y":     c.testou_em_br0y || c.testouEmBR0Y || '',
            "Produtos Reclamados": produtosStr,
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet['!cols'] = [
        { wch: 14 }, // Data
        { wch: 22 }, // Número do Caso
        { wch: 16 }, // Testou em BR0Y
        { wch: 60 }, // Produtos Reclamados
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Casos BR01");

    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,'0')}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()}`;
    XLSX.writeFile(workbook, `Casos_BR01_${dateStr}.xlsx`);
};

export const exportBacklogToExcel = (records: any[], dateLabel: string) => {
    const rows = records.map(r => ({
        "Data": r.date ? r.date.split('-').reverse().join('/') : '',
        "Caso / Chamado": r.numero_caso,
        "Responsável (RESP)": r.resp,
        "Período (PERIODO)": r.periodo,
        "Fila de Referência": r.fila,
        "Status": r.status,
        "SLA Real": r.sla_real
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    
    worksheet['!cols'] = [
        { wch: 15 }, // Data
        { wch: 20 }, // Caso
        { wch: 25 }, // RESP
        { wch: 20 }, // Período
        { wch: 25 }, // Fila
        { wch: 20 }, // Status
        { wch: 15 }, // SLA Real
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatorio Backlog");

    const cleanDate = dateLabel.replace(/\//g, '-').replace(/ /g, '_');
    const fileName = `Relatorio_Backlog_${cleanDate}.xlsx`;

    XLSX.writeFile(workbook, fileName);
};

