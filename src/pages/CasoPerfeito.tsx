import React, { useState } from 'react';
import { ShieldCheck, Plus } from 'lucide-react';
import { CasoPerfeitoTable } from '../components/CasoPerfeitoTable';
import { CasoPerfeitoFormModal } from '../components/CasoPerfeitoFormModal';
import { CasoPerfeitoRecord } from '../types';
import { useCasoPerfeito } from '../contexts/CasoPerfeitoContext';

export const CasoPerfeito: React.FC = () => {
    const { hasAccess } = useCasoPerfeito();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<CasoPerfeitoRecord | null>(null);

    // Se o usuário tentar acessar a rota sem permissão
    if (!hasAccess) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-12 text-center border border-red-100 dark:border-red-900/30">
                <ShieldCheck size={64} className="text-red-500 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-slate-800 dark:text-white italic tracking-tighter">Acesso Restrito</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold">Você não tem permissão para acessar o piloto Caso Perfeito.</p>
            </div>
        );
    }

    const handleAddNew = () => {
        setEditingRecord(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record: CasoPerfeitoRecord) => {
        setEditingRecord(record);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-10 duration-700">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] shadow-2xl p-8 md:p-12 border-4 border-orange-600 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <ShieldCheck size={120} className="text-white" />
                </div>
                
                <div className="z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-orange-600/20 text-orange-400 px-4 py-1.5 rounded-full mb-4">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Projeto Piloto</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter">
                        Caso <span className="text-orange-500">Perfeito</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm mt-2">
                        Acompanhamento e gestão de casos especiais.
                    </p>
                </div>

                <button
                    onClick={handleAddNew}
                    className="z-10 bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl shadow-orange-600/30 active:scale-95 group"
                >
                    <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-90 transition-transform">
                        <Plus size={18} />
                    </div>
                    Novo Caso
                </button>
            </div>

            <CasoPerfeitoTable onEdit={handleEdit} />

            <CasoPerfeitoFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                recordToEdit={editingRecord}
            />
        </div>
    );
};
