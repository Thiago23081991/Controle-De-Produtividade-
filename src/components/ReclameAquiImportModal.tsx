import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useReclameAqui } from '../contexts/ReclameAquiContext';
import { X, Upload, Clipboard, CheckCircle, AlertCircle, Play, Loader2, ArrowRight } from 'lucide-react';
import { ReclameAquiRecord } from '../types';

interface ReclameAquiImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AVAILABLE_FIELDS: { field: keyof ReclameAquiRecord; label: string }[] = [
    { field: 'registro_ra', label: 'Registro R.A.' },
    { field: 'nota_fiscal', label: 'Nota Fiscal / Nota' },
    { field: 'data_postagem', label: 'Data Da Postagem' },
    { field: 'consumidor', label: 'Consumidor' },
    { field: 'entrada', label: 'Entrada' },
    { field: 'status_atual', label: 'Status Atual' },
    { field: 'chamado', label: 'Chamado' },
    { field: 'email', label: 'E-mail' },
    { field: 'data_contato', label: 'Data do Contato' },
    { field: 'resposta_publica', label: 'Resposta Pública' },
    { field: 'patologia_causa', label: 'Patologia / Causa RA' },
    { field: 'voltaria_fazer_negocio', label: 'Voltaria fazer negócio' },
    { field: 'resolvido', label: 'Resolvido' },
    { field: 'nota_avaliacao', label: 'Nota Avaliação (RA)' },
    { field: 'moderacao', label: 'Moderação' },
    { field: 'visita_tecnica', label: 'Visita Técnica (Nome Técnico)' },
    { field: 'data_replica', label: 'Data Réplica' },
    { field: 'data_treplica', label: 'Data Tréplica' },
    { field: 'procedente', label: 'Procedente' },
    { field: 'mo', label: 'MO (Mão de Obra)' },
    { field: 'produto', label: 'Produto' },
];

export const ReclameAquiImportModal: React.FC<ReclameAquiImportModalProps> = ({ isOpen, onClose }) => {
    const { importBatch, isSaving } = useReclameAqui();
    const [step, setStep] = useState<1 | 2>(1);
    const [pasteData, setPasteData] = useState('');
    const [fileName, setFileName] = useState('');
    const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
    const [parsedRows, setParsedRows] = useState<any[][]>([]);
    const [mappings, setMappings] = useState<Record<number, string>>({});
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const autoDetectMapping = (headers: string[]): Record<number, string> => {
        const maps: Record<number, string> = {};
        let seenNotaCount = 0;

        headers.forEach((h, index) => {
            const hLower = h.toLowerCase().trim();
            if (hLower === '') return;

            if (['registro r.a', 'registro ra', 'registro_ra', 'registro'].some(k => hLower.includes(k))) {
                maps[index] = 'registro_ra';
            } else if (['data da postagem', 'data postagem', 'postagem'].some(k => hLower.includes(k))) {
                maps[index] = 'data_postagem';
            } else if (['consumidor', 'cliente', 'reclamante'].some(k => hLower.includes(k))) {
                maps[index] = 'consumidor';
            } else if (['entrada', 'canal'].some(k => hLower.includes(k))) {
                maps[index] = 'entrada';
            } else if (['status atual', 'status_atual', 'status'].some(k => hLower.includes(k))) {
                maps[index] = 'status_atual';
            } else if (['chamado', 'ticket', 'protocolo'].some(k => hLower.includes(k))) {
                maps[index] = 'chamado';
            } else if (['e-mail', 'email'].some(k => hLower.includes(k))) {
                maps[index] = 'email';
            } else if (['data do contato', 'data contato', 'contato'].some(k => hLower.includes(k))) {
                maps[index] = 'data_contato';
            } else if (['resposta pública', 'resposta publica', 'resposta'].some(k => hLower.includes(k))) {
                maps[index] = 'resposta_publica';
            } else if (['patologia', 'causa', 'motivo'].some(k => hLower.includes(k))) {
                maps[index] = 'patologia_causa';
            } else if (['voltaria', 'negócio', 'negocio'].some(k => hLower.includes(k))) {
                maps[index] = 'voltaria_fazer_negocio';
            } else if (['resolvido', 'resolv'].some(k => hLower.includes(k))) {
                maps[index] = 'resolvido';
            } else if (['moderação', 'moderacao'].some(k => hLower.includes(k))) {
                maps[index] = 'moderacao';
            } else if (['visita', 'técnico', 'tecnico'].some(k => hLower.includes(k))) {
                maps[index] = 'visita_tecnica';
            } else if (['réplica', 'replica'].some(k => hLower.includes(k)) && !hLower.includes('tréplica') && !hLower.includes('treplica')) {
                maps[index] = 'data_replica';
            } else if (['tréplica', 'treplica'].some(k => hLower.includes(k))) {
                maps[index] = 'data_treplica';
            } else if (['procedente', 'proced'].some(k => hLower.includes(k))) {
                maps[index] = 'procedente';
            } else if (hLower === 'mo' || ['mão de obra', 'mao de obra'].some(k => hLower.includes(k))) {
                maps[index] = 'mo';
            } else if (['produto', 'item', 'linha'].some(k => hLower.includes(k))) {
                maps[index] = 'produto';
            } else if (['nota fiscal', 'nf'].some(k => hLower.includes(k))) {
                maps[index] = 'nota_fiscal';
            } else if (hLower === 'nota' || hLower.includes('avalia')) {
                seenNotaCount++;
                if (seenNotaCount === 1 && index <= 2) {
                    maps[index] = 'nota_fiscal';
                } else {
                    maps[index] = 'nota_avaliacao';
                }
            }
        });

        return maps;
    };

    const processRawData = (headers: string[], rows: any[][]) => {
        setParsedHeaders(headers);
        setParsedRows(rows);
        const autoMaps = autoDetectMapping(headers);
        setMappings(autoMaps);
        setStep(2);
        setErrorMsg('');
    };

    const handlePasteSubmit = () => {
        if (!pasteData.trim()) {
            setErrorMsg('Por favor, cole os dados antes de continuar.');
            return;
        }

        const lines = pasteData.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            setErrorMsg('Os dados colados devem conter pelo menos a linha de cabeçalho e uma linha de dados.');
            return;
        }

        const rawHeaders = lines[0].split('\t').map(h => h.trim());
        const rows = lines.slice(1).map(l => l.split('\t').map(c => c.trim()));
        setFileName('Dados colados');
        processRawData(rawHeaders, rows);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, raw: false });

                if (data.length < 2) {
                    setErrorMsg('A planilha está vazia ou contém apenas o cabeçalho.');
                    return;
                }

                const rawHeaders = (data[0] || []).map((h: any) => String(h || '').trim());
                const rows = data.slice(1);
                processRawData(rawHeaders, rows);
            } catch (err) {
                console.error(err);
                setErrorMsg('Erro ao ler arquivo Excel. Verifique se o formato é válido.');
            }
        };

        reader.readAsBinaryString(file);
    };

    const handleMappingChange = (colIndex: number, field: string) => {
        setMappings(prev => {
            const next = { ...prev };
            if (field === '') {
                delete next[colIndex];
            } else {
                next[colIndex] = field;
            }
            return next;
        });
    };

    const handleConfirmImport = async () => {
        const recordsToInsert: Omit<ReclameAquiRecord, 'id' | 'created_at'>[] = [];

        parsedRows.forEach(row => {
            const record: Record<string, any> = {};

            Object.entries(mappings).forEach(([colIdxStr, fieldKey]) => {
                const colIdx = parseInt(colIdxStr, 10);
                let val = row[colIdx];
                if (val !== undefined && val !== null) {
                    record[fieldKey] = String(val).trim();
                }
            });

            if (record.registro_ra || record.consumidor || record.chamado || record.data_postagem) {
                recordsToInsert.push(record);
            }
        });

        if (recordsToInsert.length === 0) {
            setErrorMsg('Nenhuma linha válida encontrada para importar.');
            return;
        }

        const count = await importBatch(recordsToInsert);
        if (count > 0) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in duration-300">

                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-2xl">
                            <Upload size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Importar Planilha Reclame Aqui</h2>
                            <p className="text-red-100 text-xs font-bold">
                                {step === 1 ? 'Passo 1: Selecione o arquivo ou cole os dados' : 'Passo 2: Confirme o mapeamento das colunas'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">

                    {errorMsg && (
                        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-2xl text-red-600 dark:text-red-300 text-xs font-bold">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="space-y-6">
                            {/* Upload de arquivo */}
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center hover:border-red-400 dark:hover:border-red-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".xlsx, .xls, .csv"
                                    className="hidden"
                                />
                                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <Upload size={24} />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white mb-1">
                                    Selecione sua planilha Excel (.xlsx, .xls ou .csv)
                                </h3>
                                <p className="text-xs text-slate-400 mb-4">
                                    O sistema identificará automaticamente as 21 colunas da base.
                                </p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-red-900/20"
                                >
                                    Escolher Arquivo
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ou cole os dados do Excel</span>
                                <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                            </div>

                            {/* Colar dados */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Clipboard size={12} />
                                    Copie e cole direto da sua planilha (com cabeçalhos)
                                </label>
                                <textarea
                                    value={pasteData}
                                    onChange={e => setPasteData(e.target.value)}
                                    placeholder="Copie as linhas da planilha com o cabeçalho e cole aqui..."
                                    rows={6}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs font-mono text-slate-700 dark:text-slate-200 focus:border-red-400 outline-none resize-none"
                                />
                                <button
                                    onClick={handlePasteSubmit}
                                    className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                >
                                    Processar Texto Copiado
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                                <div>
                                    <p className="text-xs font-black text-slate-800 dark:text-white">Arquivo: {fileName}</p>
                                    <p className="text-[11px] text-slate-400 font-bold">
                                        {parsedRows.length} linhas detectadas • {parsedHeaders.length} colunas
                                    </p>
                                </div>
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline"
                                >
                                    Trocar arquivo
                                </button>
                            </div>

                            <p className="text-[11px] font-bold text-slate-500">
                                Verifique se as colunas da sua planilha foram mapeadas corretamente para os campos do sistema:
                            </p>

                            {/* Grade de mapeamento */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2">
                                {parsedHeaders.map((header, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase">Coluna {idx + 1}</span>
                                            <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate" title={header}>
                                                {header || '(Sem título)'}
                                            </p>
                                        </div>
                                        <select
                                            value={mappings[idx] || ''}
                                            onChange={e => handleMappingChange(idx, e.target.value)}
                                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:border-red-400 outline-none w-48 shrink-0"
                                        >
                                            <option value="">-- Ignorar --</option>
                                            {AVAILABLE_FIELDS.map(f => (
                                                <option key={f.field} value={f.field}>{f.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 2 && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                        <button
                            onClick={() => setStep(1)}
                            className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                        >
                            Voltar
                        </button>
                        <button
                            onClick={handleConfirmImport}
                            disabled={isSaving}
                            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-red-900/30 active:scale-95"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Importando ({parsedRows.length} linhas)...
                                </>
                            ) : (
                                <>
                                    <Play size={16} />
                                    Confirmar e Importar {parsedRows.length} Casos
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
