import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useErros } from '../contexts/ErrosContext';
import { useAuth } from '../contexts/AuthContext';

interface ErroFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const ERROS_EXPERTS = [
    'ANA PATRICIA PEREIRA SOUSA',
    'BRENNDA SUYANE GOMES DE OLIVEIRA MORAES',
    'BRUNO MACIEL DE ARAUJO',
    'CAIO FELIPE DA SILVA',
    'CRISLANE LIMA DE SOUZA',
    'DOUGLAS FALCAO CAVALCANTE',
    'EDUARDA TACIANA DA SILVA AVELINO FERREIRA',
    'EDUARDO NASCIMENTO E SILVA',
    'EMANUELLE COBO SALLES',
    'GABRIELA PINHEIRO',
    'GIOVANNA AIORFE DIAS',
    'GUILHERME SOARES DA SILVA',
    'GUSTAVO HENRIQUE DOS SANTOS CAMPOS',
    'INGRYD OLIVEIRA MENDES DE BRITO',
    'JOAO PEDRO MARTINS CARVALHO',
    'KAWANY MATHIOLA SOUTO RIBEIRO',
    'KETHELIN SENNA PEREIRA',
    'KETLYN DAIANE DA SILVA FREIRE',
    'LUCINEIA BENEDITO DE SOUZA RIBEIRO',
    'LUIZ FERNANDO DE SOUZA DA SILVA',
    'NATAGLIA CHALEGRA DA SILVA',
    'RAFAELA RAVENA PEREIRA PADILHA DOS ROSARIO',
    'ROBERTA NICOLETTI PORTELA',
    'RODRIGO FERREIRA DE VASCONCELOS',
    'SABRINA DA SILVA',
    'SOFIA LAURA VIALE BRANDAO',
    'TATIANE APARECIDA DE ARAUJO JACINTO',
    'VINICIUS LOPES LINS'
];

const MOTIVO_OPTIONS = [
    'Erro Script',
    'Outro'
];

const SUBMOTIVO_OPTIONS = [
    'Cod. produto',
    'Descrição',
    'Cor',
    'Quantidade',
    'Form embal a ser ressarcido',
    'Motivo',
    'Pessoa de contato',
    'E-mail',
    'SAP Compra'
];

export const ErroFormModal: React.FC<ErroFormModalProps> = ({ isOpen, onClose }) => {
    const { addErro, isSaving } = useErros();
    const { currentUser, isAdmin } = useAuth();

    const [numeroCaso, setNumeroCaso] = useState('');
    const [expertName, setExpertName] = useState('');
    const [descricaoErro, setDescricaoErro] = useState('');
    const [date, setDate] = useState(getTodayString());
    const [motivo, setMotivo] = useState('');
    const [submotivo, setSubmotivo] = useState('');

    useEffect(() => {
        if (isOpen) {
            setNumeroCaso('');
            setExpertName('');
            setDescricaoErro('');
            setDate(getTodayString());
            setMotivo('');
            setSubmotivo('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!numeroCaso.trim() || !expertName || !descricaoErro.trim() || !motivo) return;
        if (motivo === 'Erro Script' && !submotivo) return;

        const success = await addErro({
            date,
            numero_caso: numeroCaso.trim(),
            expert_name: expertName,
            descricao_erro: descricaoErro.trim(),
            motivo,
            submotivo: motivo === 'Erro Script' ? submotivo : undefined,
        });

        if (success) onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300">

                {/* Header */}
                <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 opacity-10">
                        <AlertTriangle size={120} className="text-white" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-2xl">
                                <AlertTriangle size={22} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Registrar Erro</h2>
                                <p className="text-red-200 text-[10px] font-bold uppercase tracking-widest">Script de Ressarcimento</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5">

                    {/* Data */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Data
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                        />
                    </div>

                    {/* Número do Caso */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Nº do Caso / Atividade <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={numeroCaso}
                            onChange={e => setNumeroCaso(e.target.value)}
                            placeholder="Ex: 2024-123456"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:font-normal placeholder:text-slate-300"
                        />
                    </div>

                    {/* Expert que errou */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Expert que Errou <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={expertName}
                            onChange={e => setExpertName(e.target.value)}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Selecione o expert...</option>
                            {ERROS_EXPERTS.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Motivo */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Motivo <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={motivo}
                            onChange={e => {
                                setMotivo(e.target.value);
                                setSubmotivo(''); // Limpa o submotivo quando muda o motivo
                            }}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Selecione o motivo...</option>
                            {MOTIVO_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Submotivo (exibido apenas se motivo for 'Erro Script') */}
                    {motivo === 'Erro Script' && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Submotivo <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={submotivo}
                                onChange={e => setSubmotivo(e.target.value)}
                                required
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Selecione o submotivo...</option>
                                {SUBMOTIVO_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Descrição do Erro */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Onde está o erro no script <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={descricaoErro}
                            onChange={e => setDescricaoErro(e.target.value)}
                            placeholder="Descreva onde e qual foi o erro no script de ressarcimento..."
                            required
                            rows={4}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none placeholder:font-normal placeholder:text-slate-300"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !numeroCaso || !expertName || !descricaoErro || !motivo || (motivo === 'Erro Script' && !submotivo)}
                            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-200 active:scale-95"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
                            {isSaving ? 'Salvando...' : 'Registrar Erro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
