import React, { useState, useMemo } from 'react';
import { BacklogRecord } from '../types';
import { ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';

interface BacklogPivotTableProps {
    records: BacklogRecord[];
}

export const BacklogPivotTable: React.FC<BacklogPivotTableProps> = ({ records }) => {
    const [collapsedQueues, setCollapsedQueues] = useState<Record<string, boolean>>({});

    // 1. Obter todos os períodos e seus respectivos SLAs reais de forma hierárquica
    const columnsStructure = useMemo(() => {
        const structure: Record<string, Set<number>> = {};
        
        records.forEach(r => {
            const period = r.periodo || '0 - 30';
            const sla = typeof r.sla_real === 'number' ? r.sla_real : 0;
            
            if (!structure[period]) {
                structure[period] = new Set<number>();
            }
            structure[period].add(sla);
        });

        // Se não houver dados, retorna estrutura padrão compatível
        if (Object.keys(structure).length === 0) {
            return {
                periods: ['0 - 30'],
                periodSlas: { '0 - 30': [-3, -2, -1, 0, 1] }
            };
        }

        // Ordenar períodos
        const sortedPeriods = Object.keys(structure).sort((a, b) => a.localeCompare(b));
        
        // Ordenar SLAs dentro de cada período
        const periodSlas: Record<string, number[]> = {};
        sortedPeriods.forEach(p => {
            periodSlas[p] = Array.from(structure[p]).sort((a, b) => a - b);
        });

        return {
            periods: sortedPeriods,
            periodSlas
        };
    }, [records]);

    // 2. Processar dados para a estrutura do Pivot Table
    const pivotData = useMemo(() => {
        // Estrutura: counts[queue][status][periodo][sla_real]
        const counts: Record<string, Record<string, Record<string, Record<number, number>>>> = {};
        
        // Acumuladores de totais
        const queueTotals: Record<string, Record<string, Record<number, number>>> = {};
        const statusRowTotals: Record<string, Record<string, number>> = {};
        const queueRowTotals: Record<string, number> = {};
        
        const periodStatusTotals: Record<string, Record<string, Record<string, number>>> = {};
        const periodQueueTotals: Record<string, Record<string, number>> = {};
        
        const columnTotals: Record<string, Record<number, number>> = {};
        const periodColTotals: Record<string, number> = {};
        
        let grandTotal = 0;

        // Inicializar totais de colunas
        columnsStructure.periods.forEach(p => {
            columnTotals[p] = {};
            periodColTotals[p] = 0;
            columnsStructure.periodSlas[p].forEach(sla => {
                columnTotals[p][sla] = 0;
            });
        });

        records.forEach(r => {
            const queue = r.fila || 'Sem Fila';
            const status = r.status || 'Sem Status';
            const period = r.periodo || '0 - 30';
            const sla = typeof r.sla_real === 'number' ? r.sla_real : 0;

            // Inicializar fila
            if (!counts[queue]) {
                counts[queue] = {};
                queueTotals[queue] = {};
                queueRowTotals[queue] = 0;
                periodQueueTotals[queue] = {};
                
                columnsStructure.periods.forEach(p => {
                    queueTotals[queue][p] = {};
                    periodQueueTotals[queue][p] = 0;
                    columnsStructure.periodSlas[p].forEach(s => {
                        queueTotals[queue][p][s] = 0;
                    });
                });
            }

            // Inicializar status
            if (!counts[queue][status]) {
                counts[queue][status] = {};
                statusRowTotals[queue] = statusRowTotals[queue] || {};
                statusRowTotals[queue][status] = 0;
                
                periodStatusTotals[queue] = periodStatusTotals[queue] || {};
                periodStatusTotals[queue][status] = {};
                
                columnsStructure.periods.forEach(p => {
                    counts[queue][status][p] = {};
                    periodStatusTotals[queue][status][p] = 0;
                    columnsStructure.periodSlas[p].forEach(s => {
                        counts[queue][status][p][s] = 0;
                    });
                });
            }

            // Incrementar valores
            counts[queue][status][period][sla] = (counts[queue][status][period][sla] || 0) + 1;
            queueTotals[queue][period][sla] = (queueTotals[queue][period][sla] || 0) + 1;
            
            statusRowTotals[queue][status] += 1;
            queueRowTotals[queue] += 1;
            
            periodStatusTotals[queue][status][period] += 1;
            periodQueueTotals[queue][period] += 1;
            
            if (columnTotals[period]) {
                columnTotals[period][sla] = (columnTotals[period][sla] || 0) + 1;
            }
            periodColTotals[period] += 1;
            grandTotal += 1;
        });

        const sortedQueues = Object.keys(counts).sort((a, b) => a.localeCompare(b));
        const sortedStatuses: Record<string, string[]> = {};
        sortedQueues.forEach(q => {
            sortedStatuses[q] = Object.keys(counts[q]).sort((a, b) => a.localeCompare(b));
        });

        return {
            queues: sortedQueues,
            statuses: sortedStatuses,
            counts,
            queueTotals,
            statusRowTotals,
            queueRowTotals,
            periodStatusTotals,
            periodQueueTotals,
            columnTotals,
            periodColTotals,
            grandTotal
        };
    }, [records, columnsStructure]);

    const toggleQueue = (queue: string) => {
        setCollapsedQueues(prev => ({
            ...prev,
            [queue]: !prev[queue]
        }));
    };

    if (records.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-12 border border-slate-100 dark:border-slate-800 text-center">
                <HelpCircle size={48} className="text-slate-400 mx-auto mb-4 animate-bounce" />
                <h3 className="text-lg font-black italic text-slate-700 dark:text-slate-200">Nenhum dado importado</h3>
                <p className="text-xs text-slate-400 font-bold mt-2 max-w-md mx-auto uppercase tracking-wider">
                    Use o botão "Importar Backlog" acima para colar os dados da sua planilha de controle diário.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <div>
                    <h3 className="text-sm font-black italic uppercase tracking-wider text-slate-900 dark:text-white">Tabela Dinâmica de Backlog</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Estrutura baseada nos filtros e colunas da planilha</p>
                </div>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        {/* Linha 1 de Cabeçalho: Períodos */}
                        <tr className="bg-slate-100/70 dark:bg-slate-800/40 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-slate-800">
                            <th className="p-4" colSpan={2} rowSpan={2}>Contagem de Status</th>
                            
                            {columnsStructure.periods.map(period => {
                                // O colSpan deve cobrir todos os SLAs daquele período + 1 coluna para o Total do período
                                const numSlas = columnsStructure.periodSlas[period].length;
                                return (
                                    <th 
                                        key={period} 
                                        className="p-2 text-center bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border-x border-slate-200/50 dark:border-slate-800" 
                                        colSpan={numSlas + 1}
                                    >
                                        Rótulos de Coluna ({period})
                                    </th>
                                );
                            })}
                            
                            <th className="p-4 text-right bg-slate-100 dark:bg-slate-800 font-black border-l border-slate-200 dark:border-slate-800 w-[110px]" rowSpan={2}>
                                Total Geral
                            </th>
                        </tr>
                        
                        {/* Linha 2 de Cabeçalho: SLAs Reais e Totais do Período */}
                        <tr className="bg-slate-50 dark:bg-slate-900/90 text-xs font-black uppercase text-slate-655 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                            {columnsStructure.periods.map(period => (
                                <React.Fragment key={period}>
                                    {columnsStructure.periodSlas[period].map(sla => (
                                        <th 
                                            key={sla} 
                                            className={`p-3 text-center border-x border-slate-105 border-slate-100 dark:border-slate-800 w-[70px] ${
                                                sla === 0 ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-655 text-orange-600 dark:text-orange-400 font-black' :
                                                sla > 0 ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' : ''
                                            }`}
                                        >
                                            {sla}
                                        </th>
                                    ))}
                                    {/* Coluna de Total do Período */}
                                    <th className="p-3 text-center bg-slate-100/80 dark:bg-slate-800/50 font-black border-l border-slate-200 dark:border-slate-800 w-[110px]">
                                        {period} Total
                                    </th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="text-xs font-semibold text-slate-755 text-slate-700 dark:text-slate-200">
                        {pivotData.queues.map(queue => {
                            const isCollapsed = collapsedQueues[queue];
                            const statuses = pivotData.statuses[queue] || [];
                            
                            return (
                                <React.Fragment key={queue}>
                                    {/* Linha da Fila (Categoria Pai) */}
                                    <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors font-black text-slate-900 dark:text-white">
                                        <td className="p-4 flex items-center gap-2 cursor-pointer select-none" onClick={() => toggleQueue(queue)}>
                                            <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-405 text-slate-400">
                                                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                            </button>
                                            <span className="tracking-tight">{queue}</span>
                                        </td>
                                        <td className="p-4 text-slate-400 text-[10px] uppercase font-bold tracking-widest text-right">
                                            {isCollapsed ? `(${statuses.length} status)` : ''}
                                        </td>
                                        
                                        {/* Totais de Coluna por Período */}
                                        {columnsStructure.periods.map(period => (
                                            <React.Fragment key={period}>
                                                {columnsStructure.periodSlas[period].map(sla => {
                                                    const val = pivotData.queueTotals[queue]?.[period]?.[sla] || 0;
                                                    return (
                                                        <td key={sla} className="p-3 text-center border-x border-slate-100/50 dark:border-slate-800/50 font-bold">
                                                            {val > 0 ? val : '-'}
                                                        </td>
                                                    );
                                                })}
                                                {/* Total da fila neste período */}
                                                <td className="p-3 text-center bg-slate-50/80 dark:bg-slate-850/50 border-l border-slate-200 dark:border-slate-800 font-black text-slate-900 dark:text-white">
                                                    {pivotData.periodQueueTotals[queue]?.[period] || 0}
                                                </td>
                                            </React.Fragment>
                                        ))}
                                        
                                        {/* Total Geral da Fila */}
                                        <td className="p-3 text-right font-black text-slate-900 dark:text-white bg-slate-50/20 dark:bg-slate-900/10">
                                            {pivotData.queueRowTotals[queue]}
                                        </td>
                                    </tr>

                                    {/* Linhas de Status (Filhos) */}
                                    {!isCollapsed && statuses.map(status => {
                                        const statusTotal = pivotData.statusRowTotals[queue][status] || 0;
                                        
                                        return (
                                            <tr 
                                                key={status} 
                                                className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-slate-600 dark:text-slate-300"
                                            >
                                                <td className="p-3 pl-10 text-slate-500 dark:text-slate-400 font-medium">
                                                    {status}
                                                </td>
                                                <td className="p-3"></td>
                                                
                                                {/* Valores por Período e SLA */}
                                                {columnsStructure.periods.map(period => (
                                                    <React.Fragment key={period}>
                                                        {columnsStructure.periodSlas[period].map(sla => {
                                                            const val = pivotData.counts[queue]?.[status]?.[period]?.[sla] || 0;
                                                            return (
                                                                <td key={sla} className="p-3 text-center border-x border-slate-100/30 dark:border-slate-800/20">
                                                                    {val > 0 ? val : '-'}
                                                                </td>
                                                            );
                                                        })}
                                                        {/* Total de status neste período */}
                                                        <td className="p-3 text-center bg-slate-50/40 dark:bg-slate-900/10 border-l border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-305 font-bold">
                                                            {pivotData.periodStatusTotals[queue]?.[status]?.[period] || 0}
                                                        </td>
                                                    </React.Fragment>
                                                ))}
                                                
                                                {/* Total Geral do Status */}
                                                <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">
                                                    {statusTotal}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}

                        {/* Linha de Total Geral */}
                        <tr className="bg-sky-50/50 dark:bg-sky-950/20 border-t-2 border-slate-200 dark:border-slate-700 font-black text-slate-900 dark:text-white shadow-[0_-2px_0_0_rgba(0,0,0,0.05)]">
                            <td className="p-4 uppercase tracking-widest text-xs" colSpan={2}>Total Geral</td>
                            
                            {/* Totais de Coluna por Período */}
                            {columnsStructure.periods.map(period => (
                                <React.Fragment key={period}>
                                    {columnsStructure.periodSlas[period].map(sla => {
                                        const val = pivotData.columnTotals[period]?.[sla] || 0;
                                        return (
                                            <td key={sla} className="p-3 text-center border-x border-slate-200 dark:border-slate-700 font-black text-slate-900 dark:text-white">
                                                {val}
                                            </td>
                                        );
                                    })}
                                    {/* Total Geral do Período */}
                                    <td className="p-3 text-center bg-sky-100/60 dark:bg-sky-950/40 border-l border-slate-300 dark:border-slate-600 font-black text-slate-900 dark:text-white">
                                        {pivotData.periodColTotals[period]}
                                    </td>
                                </React.Fragment>
                            ))}
                            
                            {/* Total Geral Final */}
                            <td className="p-3 text-right font-black text-slate-900 dark:text-white bg-sky-100/20 dark:bg-sky-950/10 text-sm">
                                {pivotData.grandTotal}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            {/* Legenda */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-900/20 flex flex-wrap gap-4 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-705 inline-block"></span> Negativos: Dentro do Prazo / Dias Restantes
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-200 dark:bg-orange-900/30 inline-block"></span> Zero (0): Vence Hoje
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-200 dark:bg-red-900/30 inline-block"></span> Positivos: Dias de Atraso
                </span>
            </div>
        </div>
    );
};
