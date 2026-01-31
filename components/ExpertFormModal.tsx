import React, { useState, useEffect } from 'react';
import { X, Save, User, Hash, Key, UserCheck } from 'lucide-react';
import { ExpertInfo } from '../types';

interface ExpertFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (expert: Partial<ExpertInfo>) => void;
    initialData?: ExpertInfo | null;
    supervisors: string[];
}

export const ExpertFormModal: React.FC<ExpertFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    supervisors
}) => {
    const [formData, setFormData] = useState<Partial<ExpertInfo>>({
        name: '',
        matricula: '',
        login: '',
        supervisor: '',
        active: true
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                matricula: '',
                login: '',
                supervisor: '',
                active: true
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-slate-900 p-6 flex justify-between items-center">
                    <h3 className="text-white font-black uppercase tracking-widest flex items-center gap-2">
                        <UserCheck className="text-orange-500" />
                        {initialData ? 'Editar Expert' : 'Novo Expert'}
                    </h3>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Nome */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-slate-300" size={18} />
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-slate-700 focus:border-orange-400 outline-none transition-colors"
                                placeholder="NOME DO EXPERT"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Matrícula */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Matrícula</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-3.5 text-slate-300" size={18} />
                                <input
                                    required
                                    type="text"
                                    value={formData.matricula}
                                    onChange={e => setFormData({ ...formData, matricula: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-slate-700 focus:border-orange-400 outline-none transition-colors"
                                    placeholder="000000"
                                />
                            </div>
                        </div>

                        {/* Login */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Login de Rede</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-3.5 text-slate-300" size={18} />
                                <input
                                    required
                                    type="text"
                                    value={formData.login}
                                    onChange={e => setFormData({ ...formData, login: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-slate-700 focus:border-orange-400 outline-none transition-colors"
                                    placeholder="USUARIO"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Supervisor */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Supervisor</label>
                        <div className="relative">
                            <select
                                value={formData.supervisor}
                                onChange={e => setFormData({ ...formData, supervisor: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-4 text-sm font-bold text-slate-700 focus:border-orange-400 outline-none transition-colors appearance-none"
                            >
                                <option value="">SELECIONE UM SUPERVISOR</option>
                                {supervisors.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                                {/* Allow typing a new one? For now just selection, can add "Other" later */}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs hover:bg-slate-200 transition-colors"
                        >
                            CANCELAR
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-lg shadow-orange-200"
                        >
                            <Save size={16} />
                            SALVAR
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
