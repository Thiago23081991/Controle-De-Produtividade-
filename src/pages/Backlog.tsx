import React, { useState } from 'react';
import { useBacklog } from '../contexts/BacklogContext';
import { BacklogPivotTable } from '../components/BacklogPivotTable';
import { BacklogImportModal } from '../components/BacklogImportModal';
import { BacklogFormModal } from '../components/BacklogFormModal';
import { exportBacklogToExcel } from '../utils/excelExport';
import { 
    ListTodo, Plus, Trash2, Download, Upload, Search, 
    ChevronLeft, ChevronRight, Edit2, SlidersHorizontal, CheckSquare, Square
} from 'lucide-react';
import { BacklogRecord } from '../types';

export const Backlog: React.FC = () => {
    const {
        records, filteredRecords, isLoading, isSaving,
        selectedDate, setSelectedDate,
        selectedResps, setSelectedResps,
        selectedTps, setSelectedTps,
        allResps, allTps,
        clearBacklog, deleteRecord
    } = useBacklog();

    const [activeTab, setActiveTab] = useState<'pivot' | 'raw'>('pivot');
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<BacklogRecord | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination state for raw table
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Dropdowns visibility states
    const [showRespDropdown, setShowRespDropdown] = useState(false);
    const [showTpDropdown, setShowTpDropdown] = useState(false);

    // Date display formatter
    const formattedDateLabel = selectedDate.split('-').reverse().join('/');

    // Filter raw records based on search term
    const searchedRecords = React.useMemo(() => {
        if (!searchTerm.trim()) return filteredRecords;
        const term = searchTerm.toLowerCase();
        return filteredRecords.filter(r => 
            (r.numero_caso || '').toLowerCase().includes(term) ||
            (r.fila || '').toLowerCase().includes(term) ||
            (r.status || '').toLowerCase().includes(term) ||
            (r.resp || '').toLowerCase().includes(term) ||
            (r.periodo || '').toLowerCase().includes(term) ||
            (r.tp || '').toLowerCase().includes(term)
        );
    }, [filteredRecords, searchTerm]);

    // Paginated records
    const paginatedRecords = React.useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return searchedRecords.slice(start, start + itemsPerPage);
    }, [searchedRecords, currentPage]);

    const totalPages = Math.ceil(searchedRecords.length / itemsPerPage);

    const handleClearBacklog = async () => {
        if (window.confirm(`Tem certeza que deseja apagar TODO o backlog do dia ${formattedDateLabel}?`)) {
            await clearBacklog();
        }
    };

    const handleEditRecord = (record: BacklogRecord) => {
        setEditingRecord(record);
        setIsFormOpen(true);
    };

    const handleNewRecord = () => {
        setEditingRecord(null);
        setIsFormOpen(true);
    };

    const handleDeleteRecord = async (id: string) => {
        if (window.confirm('Tem certeza que deseja deletar este caso do backlog?')) {
            await deleteRecord(id);
        }
    };

    const handleExportExcel = () => {
        exportBacklogToExcel(filteredRecords, formattedDateLabel);
    };

    const toggleRespFilter = (resp: string) => {
        setSelectedResps(
            selectedResps.includes(resp)
                ? selectedResps.filter(r => r !== resp)
                : [...selectedResps, resp]
        );
        setCurrentPage(1);
    };

    const toggleTpFilter = (tp: string) => {
        setSelectedTps(
            selectedTps.includes(tp)
                ? selectedTps.filter(t => t !== tp)
                : [...selectedTps, tp]
        );
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSelectedResps([]);
        setSelectedTps([]);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-10 duration-700">
            {/* Banner Hero */}
            <div className="bg-gradient-to-br from-slate-900 to-sky-955 bg-gradient-to-br from-slate-900 to-sky-950 rounded-[3rem] shadow-2xl p-8 md:p-12 border-4 border-sky-600 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="absolute -top-8 -right-8 opacity-5 pointer-events-none">
                    <ListTodo size={200} className="text-sky-500" />
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-600 via-teal-500 to-sky-600" />

                <div className="z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-sky-600/20 text-sky-400 px-4 py-1.5 rounded-full mb-4">
                        <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Painel Operacional</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter">
                        Controle de <span className="text-sky-505 text-sky-500">Backlog</span>
                    </h1>
                    <p className="text-slate-405 text-slate-400 font-bold text-sm mt-2">
                        Acompanhamento e visão de envelhecimento (SLA) da operação.
                    </p>
                </div>

                {/* Ações do Hero */}
                <div className="flex flex-wrap items-center gap-3 z-10 justify-center">
                    {records.length > 0 && (
                        <>
                            <button
                                onClick={handleClearBacklog}
                                className="p-4 rounded-2xl bg-red-955/40 border border-red-900/35 hover:bg-red-900/30 text-red-400 hover:text-red-300 transition-colors"
                                title="Limpar tudo desta data"
                            >
                                <Trash2 size={18} />
                            </button>
                            
                            <button
                                onClick={handleExportExcel}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all border border-slate-700 shadow-xl active:scale-95"
                                title="Exportar para Planilha Excel"
                            >
                                <Download size={18} />
                                Exportar
                            </button>
                        </>
                    )}

                    <button
                        onClick={handleNewRecord}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all border border-slate-700 shadow-xl active:scale-95"
                    >
                        <Plus size={18} />
                        Novo Caso
                    </button>

                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl shadow-sky-900/40 active:scale-95 group"
                    >
                        <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-180 transition-transform duration-500">
                            <Upload size={18} />
                        </div>
                        Importar Backlog
                    </button>
                </div>
            </div>

            {/* Seletor de Data e Filtros */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 transition-colors">
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    {/* Seletor de Data */}
                    <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Data do Backlog</span>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 px-4 text-xs font-black text-slate-605 text-slate-600 dark:text-slate-350 uppercase tracking-wide focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
                        />
                    </div>

                    {/* Filtro por RESP (Multi-select) */}
                    {allResps.length > 0 && (
                        <div className="space-y-1 relative">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Filtro RESP</span>
                            <button
                                onClick={() => { setShowRespDropdown(!showRespDropdown); setShowTpDropdown(false); }}
                                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 px-4 text-xs font-black text-slate-600 dark:text-slate-350 uppercase tracking-wide focus:ring-2 focus:ring-sky-500 outline-none flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                            >
                                <SlidersHorizontal size={12} />
                                {selectedResps.length === 0 ? 'Todos Resps' : `${selectedResps.length} Selecionados`}
                            </button>
                            
                            {showRespDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl p-4 z-50 space-y-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Responsável (RESP)</span>
                                        <button 
                                            onClick={() => setSelectedResps([])} 
                                            className="text-[9px] font-black uppercase text-sky-600 hover:text-sky-500"
                                        >
                                            Limpar
                                        </button>
                                    </div>
                                    <div className="space-y-1 pt-1">
                                        {allResps.map(resp => {
                                            const isSelected = selectedResps.includes(resp);
                                            return (
                                                <div 
                                                    key={resp}
                                                    onClick={() => toggleRespFilter(resp)}
                                                    className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/35 rounded-lg cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-350"
                                                >
                                                    {isSelected ? <CheckSquare size={14} className="text-sky-600" /> : <Square size={14} className="text-slate-400" />}
                                                    <span className="truncate">{resp}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Filtro por TP / Tipo de Atividade (Multi-select) */}
                    {allTps.length > 0 && (
                        <div className="space-y-1 relative">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Filtro TP (Atividade)</span>
                            <button
                                onClick={() => { setShowTpDropdown(!showTpDropdown); setShowRespDropdown(false); }}
                                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 px-4 text-xs font-black text-slate-605 text-slate-600 dark:text-slate-350 uppercase tracking-wide focus:ring-2 focus:ring-sky-500 outline-none flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                            >
                                <SlidersHorizontal size={12} />
                                {selectedTps.length === 0 ? 'Todos TPs' : `${selectedTps.length} Selecionados`}
                            </button>
                            
                            {showTpDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl p-4 z-50 space-y-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tipo de Atividade (TP)</span>
                                        <button 
                                            onClick={() => setSelectedTps([])} 
                                            className="text-[9px] font-black uppercase text-sky-605 text-sky-600 hover:text-sky-555"
                                        >
                                            Limpar
                                        </button>
                                    </div>
                                    <div className="space-y-1 pt-1">
                                        {allTps.map(tp => {
                                            const isSelected = selectedTps.includes(tp);
                                            return (
                                                <div 
                                                    key={tp}
                                                    onClick={() => toggleTpFilter(tp)}
                                                    className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/35 rounded-lg cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-350"
                                                >
                                                    {isSelected ? <CheckSquare size={14} className="text-sky-600" /> : <Square size={14} className="text-slate-400" />}
                                                    <span className="truncate">{tp}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botão de Limpar Filtros */}
                    {(selectedResps.length > 0 || selectedTps.length > 0) && (
                        <button
                            onClick={clearFilters}
                            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-650 self-end mb-1"
                        >
                            Limpar Filtros
                        </button>
                    )}
                </div>

                {/* Abas e Status Geral */}
                <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('pivot')}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'pivot' ? 'bg-white dark:bg-slate-700 shadow-md text-sky-600 dark:text-white' : 'text-slate-400 hover:text-slate-650'}`}
                    >
                        Tabela Dinâmica
                    </button>
                    <button
                        onClick={() => setActiveTab('raw')}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'raw' ? 'bg-white dark:bg-slate-700 shadow-md text-sky-600 dark:text-white' : 'text-slate-400 hover:text-slate-650'}`}
                    >
                        Dados Brutos ({filteredRecords.length})
                    </button>
                </div>
            </div>

            {/* Conteúdo Principal */}
            {isLoading ? (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-16 text-center border border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">Carregando informações do backlog...</p>
                </div>
            ) : activeTab === 'pivot' ? (
                <BacklogPivotTable records={filteredRecords} />
            ) : (
                /* Aba de Dados Brutos */
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-900/50">
                        <div>
                            <h3 className="text-sm font-black italic uppercase tracking-wider text-slate-900 dark:text-white">Lista de Casos</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Exibindo registros brutos para edição manual</p>
                        </div>
                        
                        {/* Busca */}
                        <div className="relative w-full sm:w-64 group">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                placeholder="Buscar caso, fila, status..."
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-755 dark:text-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 outline-none"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-sky-500 transition-colors">
                                <Search size={14} />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/90 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-850">
                                    <th className="p-4">Número do Caso</th>
                                    <th className="p-4">Fila de Referência</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center">SLA Real</th>
                                    <th className="p-4">RESP</th>
                                    <th className="p-4">TP (Atividade)</th>
                                    <th className="p-4">Período</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {paginatedRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-10 text-center text-slate-400 font-bold uppercase tracking-wider">
                                            Nenhum caso encontrado para os critérios de busca.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRecords.map(record => (
                                        <tr key={record.id} className="border-b border-slate-50 dark:border-slate-855/30 hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                                            <td className="p-4 font-mono font-black text-slate-900 dark:text-white">{record.numero_caso}</td>
                                            <td className="p-4">{record.fila}</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                                    record.status.toLowerCase().includes('aberto') ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400' :
                                                    record.status.toLowerCase().includes('andamento') ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-450' :
                                                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className={`p-4 text-center font-black ${
                                                record.sla_real === 0 ? 'text-orange-500' :
                                                record.sla_real > 0 ? 'text-red-500 animate-pulse' :
                                                'text-slate-400 dark:text-slate-600'
                                            }`}>{record.sla_real}</td>
                                            <td className="p-4 text-slate-500 dark:text-slate-450">{record.resp}</td>
                                            <td className="p-4 text-slate-500 dark:text-slate-450">{record.tp}</td>
                                            <td className="p-4 text-slate-500 dark:text-slate-450">{record.periodo}</td>
                                            <td className="p-4 text-right flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleEditRecord(record)}
                                                    className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg transition-colors"
                                                    title="Editar registro"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button
                                                    onClick={() => record.id && handleDeleteRecord(record.id)}
                                                    className="p-2 bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Deletar registro"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Mostrando {Math.min(searchedRecords.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(searchedRecords.length, currentPage * itemsPerPage)} de {searchedRecords.length} Casos
                            </span>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-500 disabled:opacity-40 rounded-xl transition-all hover:text-sky-600 active:scale-95"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-black text-slate-800 dark:text-white px-2">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-505 disabled:opacity-40 rounded-xl transition-all hover:text-sky-600 active:scale-95"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <BacklogImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
            />

            <BacklogFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                recordToEdit={editingRecord}
            />
        </div>
    );
};
