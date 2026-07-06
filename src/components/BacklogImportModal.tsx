import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useBacklog } from '../contexts/BacklogContext';
import { X, Upload, Clipboard, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { BacklogRecord } from '../types';

interface BacklogImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const REQUIRED_FIELDS: { field: keyof BacklogRecord; label: string }[] = [
    { field: 'fila', label: 'Fila de Referência' },
    { field: 'status', label: 'Status' },
    { field: 'sla_real', label: 'SLA Real' }
];

const FIELD_LABELS: Record<string, string> = {
    numero_caso: 'Número do Caso / Chamado',
    resp: 'Responsável (RESP)',
    tp: 'Tipo de Atividade (TP)',
    fila: 'Fila de Referência',
    status: 'Status',
    periodo: 'PERIODO',
    sla_real: 'SLA REAL'
};

export const BacklogImportModal: React.FC<BacklogImportModalProps> = ({ isOpen, onClose }) => {
    const { importBacklog, selectedDate } = useBacklog();
    const [step, setStep] = useState<1 | 2>(1);
    const [pasteData, setPasteData] = useState('');
    const [fileName, setFileName] = useState('');
    const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
    const [parsedRows, setParsedRows] = useState<any[][]>([]);
    const [mappings, setMappings] = useState<Record<number, string>>({});
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    // Tenta sugerir mapeamento automático com base em nomes comuns de colunas usando seu índice
    const autoDetectMapping = (headers: string[]): Record<number, string> => {
        const maps: Record<number, string> = {};
        
        headers.forEach((h, index) => {
            const hLower = h.toLowerCase().trim();
            
            if (hLower === '') return; // Pular colunas vazias
            
            if (['fila de refer', 'fila_de_referencia', 'fila de referência', 'fila', 'celula', 'célula', 'queue'].some(k => hLower.includes(k))) {
                maps[index] = 'fila';
            } else if (['status', 'situacao', 'situação', 'estado'].some(k => hLower.includes(k))) {
                maps[index] = 'status';
            } else if (['sla real', 'sla_real', 'aging', 'dias', 'atraso'].some(k => hLower.includes(k))) {
                maps[index] = 'sla_real';
            } else if (['periodo', 'período', 'intervalo', 'bucket'].some(k => hLower.includes(k))) {
                maps[index] = 'periodo';
            } else if (hLower === 'tp' || ['tipo de atividade', 'tipo_de_atividade', 'tipo atividade', 'tp', 'processo'].some(k => hLower.includes(k))) {
                maps[index] = 'tp';
            } else if (hLower === 'resp' || ['responsavel', 'responsável', 'expert', 'operador', 'resp'].some(k => hLower.includes(k))) {
                maps[index] = 'resp';
            } else if (['numero', 'caso', 'chamado', 'id', 'ticket'].some(k => hLower.includes(k))) {
                maps[index] = 'numero_caso';
            }
        });
        
        return maps;
    };

    // Processar dados em matriz (linhas e colunas)
    const processRawData = (headers: string[], rows: any[][]) => {
        setParsedHeaders(headers);
        setParsedRows(rows);
        const autoMaps = autoDetectMapping(headers);
        setMappings(autoMaps);
        setStep(2);
        setErrorMsg('');
    };

    // Handler para colar dados do Excel (TSV)
    const handlePasteSubmit = () => {
        if (!pasteData.trim()) {
            setErrorMsg('Por favor, cole alguns dados antes de continuar.');
            return;
        }

        const lines = pasteData.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            setErrorMsg('Os dados colados devem conter pelo menos uma linha de cabeçalho e uma linha de dados.');
            return;
        }

        const rawHeaders = lines[0].split('\t').map(h => h.trim());
        
        // Encontrar o último índice com cabeçalho não-vazio
        let lastActiveIndex = rawHeaders.length - 1;
        while (lastActiveIndex >= 0 && rawHeaders[lastActiveIndex] === '') {
            lastActiveIndex--;
        }

        if (lastActiveIndex < 0) {
            setErrorMsg('Não foi possível encontrar nenhum cabeçalho preenchido na primeira linha.');
            return;
        }

        const headers = rawHeaders.slice(0, lastActiveIndex + 1);
        const rows = lines.slice(1).map(line => {
            const cells = line.split('\t').map(cell => cell.trim());
            return cells.slice(0, lastActiveIndex + 1);
        });

        processRawData(headers, rows);
    };

    // Handler para upload de arquivos Excel
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
                
                if (data.length < 2) {
                    setErrorMsg('O arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados.');
                    return;
                }

                const rawHeaders = data[0].map(h => String(h || '').trim());
                
                // Encontrar o último índice com cabeçalho não-vazio
                let lastActiveIndex = rawHeaders.length - 1;
                while (lastActiveIndex >= 0 && rawHeaders[lastActiveIndex] === '') {
                    lastActiveIndex--;
                }

                if (lastActiveIndex < 0) {
                    setErrorMsg('Não foi possível encontrar nenhum cabeçalho preenchido no arquivo.');
                    return;
                }

                const headers = rawHeaders.slice(0, lastActiveIndex + 1);
                const rows = data.slice(1).map(row => {
                    const slicedRow = row.slice(0, lastActiveIndex + 1);
                    return slicedRow.map(cell => cell === undefined || cell === null ? '' : String(cell).trim());
                });

                processRawData(headers, rows);
            } catch (err) {
                console.error(err);
                setErrorMsg('Erro ao ler o arquivo Excel. Verifique se o formato é válido.');
            }
        };

        reader.readAsBinaryString(file);
    };

    // Mapear cada dropdown por índice
    const handleMappingChange = (index: number, field: string) => {
        setMappings(prev => {
            const next = { ...prev };
            if (field === '') {
                delete next[index];
            } else {
                // Evitar duplicados: se outro índice já tem esse campo, removemos ele
                Object.keys(next).forEach(key => {
                    const numKey = Number(key);
                    if (next[numKey] === field) {
                        delete next[numKey];
                    }
                });
                next[index] = field;
            }
            return next;
        });
    };

    // Validar e importar
    const handleConfirmImport = async () => {
        const mappedFields = Object.values(mappings);
        const missingFields = REQUIRED_FIELDS.filter(req => !mappedFields.includes(req.field));

        if (missingFields.length > 0) {
            setErrorMsg(`Campos obrigatórios ausentes: ${missingFields.map(f => f.label).join(', ')}`);
            return;
        }

        // Mapear os campos para os seus índices de coluna correspondentes
        const fieldIndices: Record<string, number> = {};
        Object.keys(mappings).forEach(indexStr => {
            const index = Number(indexStr);
            const field = mappings[index];
            fieldIndices[field] = index;
        });

        const importRecords: Omit<BacklogRecord, 'id'>[] = [];
        let parseErrors = 0;

        for (let i = 0; i < parsedRows.length; i++) {
            const row = parsedRows[i];
            
            if (row.length === 0 || row.every(cell => cell === '')) continue;

            const filaVal = row[fieldIndices['fila']] || '';
            const statusVal = row[fieldIndices['status']] || '';
            const slaStr = row[fieldIndices['sla_real']] || '0';
            
            let slaVal = parseInt(slaStr, 10);
            if (isNaN(slaVal)) {
                slaVal = 0;
                parseErrors++;
            }

            const numeroCasoVal = fieldIndices['numero_caso'] !== undefined ? row[fieldIndices['numero_caso']] || `BL-${i}` : `BL-${i}`;
            const respVal = fieldIndices['resp'] !== undefined ? row[fieldIndices['resp']] || 'Geral' : 'Geral';
            const periodoVal = fieldIndices['periodo'] !== undefined ? row[fieldIndices['periodo']] || '0 - 30' : '0 - 30';
            const tpVal = fieldIndices['tp'] !== undefined ? row[fieldIndices['tp']] || 'Geral' : 'Geral';

            if (!filaVal || !statusVal) continue;

            importRecords.push({
                date: selectedDate,
                fila: filaVal,
                status: statusVal,
                sla_real: slaVal,
                numero_caso: numeroCasoVal,
                resp: respVal,
                periodo: periodoVal,
                tp: tpVal
            });
        }

        if (importRecords.length === 0) {
            setErrorMsg('Nenhum registro válido pôde ser montado. Verifique os mapeamentos de coluna.');
            return;
        }

        const success = await importBacklog(importRecords);
        if (success) {
            handleReset();
            onClose();
        } else {
            setErrorMsg('Ocorreu um erro ao salvar os dados no banco.');
        }
    };

    const handleReset = () => {
        setStep(1);
        setPasteData('');
        setFileName('');
        setParsedHeaders([]);
        setParsedRows([]);
        setMappings({});
        setErrorMsg('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const formattedDate = selectedDate.split('-').reverse().join('/');

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2.5 rounded-xl">
                            <Upload className="text-orange-600 w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black italic text-slate-900 dark:text-white uppercase tracking-wider">
                                Importador de Backlog
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                Importando para a Data: <span className="text-orange-600 font-black">{formattedDate}</span>
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { handleReset(); onClose(); }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    
                    {errorMsg && (
                        <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="grid md:grid-cols-2 gap-6 h-full">
                            {/* Opção 1: Upload Arquivo */}
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:border-orange-500 transition-colors group cursor-pointer relative">
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".xlsx,.xls,.csv"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="bg-orange-50 dark:bg-orange-950/20 p-5 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                                    <Upload size={32} className="text-orange-600" />
                                </div>
                                <h4 className="text-sm font-black italic uppercase text-slate-700 dark:text-slate-200">Arquivo Excel ou CSV</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 max-w-xs">
                                    Arraste e solte o arquivo aqui ou clique para navegar no seu computador.
                                </p>
                                {fileName && (
                                    <span className="mt-4 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 max-w-full truncate">
                                        {fileName}
                                    </span>
                                )}
                            </div>

                            {/* Opção 2: Ctrl+V direto do Excel */}
                            <div className="border border-slate-200 dark:border-slate-850 rounded-3xl p-6 flex flex-col space-y-4">
                                <div className="flex items-center gap-2">
                                    <Clipboard size={18} className="text-orange-600" />
                                    <h4 className="text-xs font-black italic uppercase text-slate-700 dark:text-slate-200">Copiar e Colar Células</h4>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Selecione a tabela na sua planilha, copie (Ctrl+C) e cole (Ctrl+V) no campo abaixo:
                                </p>
                                <textarea
                                    value={pasteData}
                                    onChange={(e) => setPasteData(e.target.value)}
                                    placeholder="Cole aqui (com cabeçalho)..."
                                    className="flex-1 min-h-[160px] bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-xs font-mono text-slate-600 dark:text-slate-350 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                                />
                                <button
                                    onClick={handlePasteSubmit}
                                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-3 rounded-2xl uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                                >
                                    <Play size={12} /> Processar Dados Colados
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Passo 2: Mapeamento de Colunas */}
                            <div>
                                <h4 className="text-xs font-black italic uppercase text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                                    <CheckCircle size={16} className="text-orange-600" /> Mapeamento de Colunas detectadas
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-4">
                                    O sistema detectou {parsedHeaders.length} colunas. Mapeie cada coluna para os campos correspondentes do sistema:
                                </p>

                                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {parsedHeaders.map((header, index) => {
                                        const currentMapping = mappings[index] || '';
                                        const colDisplayName = header.trim() !== '' ? `"${header}"` : `Sem Título (Índice ${index})`;
                                        
                                        return (
                                            <div 
                                                key={index} 
                                                className={`p-3.5 border rounded-2xl transition-all flex flex-col justify-between ${
                                                    currentMapping 
                                                        ? 'border-orange-500 bg-orange-50/20 dark:bg-orange-950/10' 
                                                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
                                                }`}
                                            >
                                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider truncate mb-2 block" title={header || `Coluna ${index + 1}`}>
                                                    Coluna {index + 1}: {colDisplayName}
                                                </span>
                                                <select
                                                    value={currentMapping}
                                                    onChange={(e) => handleMappingChange(index, e.target.value)}
                                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-305 focus:ring-2 focus:ring-orange-500 outline-none"
                                                >
                                                    <option value="">-- Ignorar --</option>
                                                    {Object.entries(FIELD_LABELS).map(([field, label]) => {
                                                        const isMappedElsewhere = Object.keys(mappings).some(k => Number(k) !== index && mappings[Number(k)] === field);
                                                        const reqSuffix = ['fila', 'status', 'sla_real'].includes(field) ? ' *' : '';
                                                        return (
                                                            <option 
                                                                key={field} 
                                                                value={field}
                                                                disabled={isMappedElsewhere}
                                                                className={isMappedElsewhere ? 'opacity-45' : ''}
                                                            >
                                                                {label}{reqSuffix}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Pré-visualização de Dados */}
                            <div>
                                <h4 className="text-xs font-black italic uppercase text-slate-700 dark:text-slate-200 mb-3">
                                    Pré-visualização (Primeiras 3 linhas)
                                </h4>
                                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                                    <table className="w-full text-left text-[11px] border-collapse font-semibold">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider">
                                                {parsedHeaders.map((h, index) => (
                                                    <th key={index} className="p-3 font-bold truncate max-w-[150px]">
                                                        {h.trim() !== '' ? h : `(Coluna ${index + 1})`}
                                                        {mappings[index] && (
                                                            <span className="block text-[8px] text-orange-600 dark:text-orange-400 lowercase font-black italic mt-0.5">
                                                                ({mappings[index]})
                                                            </span>
                                                        )}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="text-slate-600 dark:text-slate-350">
                                            {parsedRows.slice(0, 3).map((row, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/40">
                                                    {parsedHeaders.map((_, cIdx) => (
                                                        <td key={cIdx} className="p-3 truncate max-w-[150px] font-mono">
                                                            {row[cIdx] !== undefined ? row[cIdx] : ''}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    {step === 2 ? (
                        <button
                            onClick={() => setStep(1)}
                            className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3.5 rounded-[1.5rem] font-black uppercase tracking-wider text-[10px] transition-all"
                        >
                            Voltar
                        </button>
                    ) : <div />}
                    
                    <div className="flex gap-3">
                        <button
                            onClick={() => { handleReset(); onClose(); }}
                            className="bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-450 px-6 py-3.5 rounded-[1.5rem] font-black uppercase tracking-wider text-[10px] transition-all"
                        >
                            Cancelar
                        </button>
                        
                        {step === 2 && (
                            <button
                                onClick={handleConfirmImport}
                                className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3.5 rounded-[1.5rem] font-black uppercase tracking-wider text-[10px] transition-all shadow-lg shadow-orange-600/20 active:scale-95"
                            >
                                Confirmar Importação ({parsedRows.length} linhas)
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
