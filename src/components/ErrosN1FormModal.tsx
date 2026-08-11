import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useErrosN1 } from '../contexts/ErrosN1Context';

interface ErrosN1FormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const N1_EXPERTS = [
    'CAUE ANDRADE SILVA',
    'JUSSARA APARECIDA DOS SANTOS MODESTO',
    'PAMELA CARDOSO DO CARMO',
    'JULIANA SOARES FREITAS',
    'KETHELEEN ELERO DA SILVA',
    'FERNANDA GOMES DE PAULA BARBOSA',
    'MELISSA VICTORIA GENUINO',
    'MARIA APARECIDA GALDINO DA SILVA',
    'NATALY GOMES DA SILVA',
    'NATHAN SILVA TORRES',
    'YASMIM FERREIRA DOS SANTOS',
    'BIANCA DE OLIVEIRA SILVA CAMPOS',
    'MICHELE CRUZ DA SILVA CUNHA',
    'ANDRESSA EVELIN DOS SANTOS PEREIRA',
    'STEVERSON MAXIMO DE MIRANDA',
    'KARINA GAVA AGEITOS',
    'ANDRESSA NASCIMENTO DA SILVA',
    'JEFFERSON GOMES DA SILVA',
    'ERIKA PAULA RODRIGUES MANÇO',
    'CINDY HARIEL OLIVEIRA COSTA',
];

const N1_MOTIVOS = [
    'Erro De Direcionamento',
    'Falta Relato',
    'Falta De Script',
    'Script Incorreto',
    'Não Desmembrou o Caso',
    'Envio E-mail Incorreto',
    'Abrir Caso Nome da Loja Mas é Consumidor',
    'Cadastro Incompleto (Falta De Dados)',
];

export const ErrosN1FormModal: React.FC<ErrosN1FormModalProps> = ({ isOpen, onClose }) => {
    const { addErro, isSaving } = useErrosN1();

    const [numeroCaso, setNumeroCaso] = useState('');
    const [expertName, setExpertName] = useState('');
    const [motivo, setMotivo] = useState('');
    const [date, setDate] = useState(getTodayString());

    useEffect(() => {
        if (isOpen) {
            setNumeroCaso('');
            setExpertName('');
            setMotivo('');
            setDate(getTodayString());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!numeroCaso.trim() || !expertName || !date || !motivo) return;

        const success = await addErro({
            date,
            numero_caso: numeroCaso.trim(),
            expert_name: expertName,
            motivo,
        });

        if (success) onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300">

                {/* Header */}
                <div className="bg-gradient-to-br from-rose-500 to-pink-700 p-8 relative overflow-hidden">
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
                                <p className="text-rose-200 text-[10px] font-bold uppercase tracking-widest">N1</p>
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

                    {/* Data de Atendimento */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Data de Atendimento <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                        />
                    </div>

                    {/* Número do Caso */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Nº do Caso <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={numeroCaso}
                            onChange={e => setNumeroCaso(e.target.value)}
                            placeholder="Ex: 2024-123456"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all placeholder:font-normal placeholder:text-slate-300"
                        />
                    </div>

                    {/* Expert N1 */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Expert N1 <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={expertName}
                            onChange={e => setExpertName(e.target.value)}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Selecione o expert...</option>
                            {N1_EXPERTS.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tabulação / Motivo */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Tabulação <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Selecione a tabulação...</option>
                            {N1_MOTIVOS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
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
                            disabled={isSaving || !numeroCaso || !expertName || !date || !motivo}
                            className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-200 active:scale-95"
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
