import React, { useState, useEffect } from 'react';
import { UserPlus, Search, UserCog, Power, CheckCircle, XCircle } from 'lucide-react';
import { ExpertInfo } from '../types';
import { expertService } from '../services/expertService';
import { ExpertFormModal } from './ExpertFormModal';

interface AdminPanelProps {
    supervisors: string[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ supervisors }) => {
    const [experts, setExperts] = useState<ExpertInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpert, setEditingExpert] = useState<ExpertInfo | null>(null);

    const loadExperts = async () => {
        setIsLoading(true);
        try {
            const data = await expertService.getAllAdmin();
            setExperts(data);
        } catch (error) {
            console.error('Failed to load experts', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadExperts();
    }, []);

    const handleSave = async (expertData: Partial<ExpertInfo>) => {
        try {
            if (editingExpert && editingExpert.id) {
                // Update
                await expertService.update(editingExpert.id, expertData);
            } else {
                // Create
                // Ensure typescript knows we are not passing an ID for create
                const newExpert = { ...expertData } as Omit<ExpertInfo, 'id'>;
                await expertService.create(newExpert);
            }
            setIsModalOpen(false);
            setEditingExpert(null);
            loadExperts(); // Refresh list
        } catch (error) {
            console.error('Error saving expert:', error);
            alert('Erro ao salvar. Verifique se a matrícula ou login já existem.');
        }
    };

    const handleToggleStatus = async (expert: ExpertInfo) => {
        if (!expert.id) return;
        if (!confirm(`Tem certeza que deseja ${expert.active ? 'DESATIVAR' : 'ATIVAR'} ${expert.name}?`)) return;

        try {
            await expertService.toggleStatus(expert.id, !expert.active);
            loadExperts();
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Erro ao alterar status.');
        }
    };

    const handleEdit = (expert: ExpertInfo) => {
        setEditingExpert(expert);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingExpert(null);
        setIsModalOpen(true);
    };

    const filteredExperts = experts.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.matricula.includes(searchTerm) ||
        e.login.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section className="space-y-6 animate-in fade-in duration-500">
            {/* Cabecalho do Painel */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="bg-orange-100 p-4 rounded-full">
                        <UserCog size={24} className="text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Gestão de Equipe</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Administração de Experts</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-3.5 text-slate-300" size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nome ou matrícula..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-600 focus:border-orange-400 outline-none transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleNew}
                        className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-xl transition-colors shadow-lg shadow-orange-200 flex items-center gap-2"
                    >
                        <UserPlus size={20} />
                        <span className="hidden md:inline font-bold text-xs">NOVO EXPERT</span>
                    </button>
                </div>
            </div>

            {/* Lista de Experts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-full py-12 text-center text-slate-400 font-bold">Carregando equipe...</div>
                ) : filteredExperts.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400 font-bold">Nenhum expert encontrado.</div>
                ) : (
                    filteredExperts.map(expert => (
                        <div key={expert.id || expert.matricula} className={`bg-white p-6 rounded-3xl shadow-sm border transaction-all group hover:shadow-md ${!expert.active ? 'opacity-60 grayscale' : 'border-slate-100'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white ${expert.active ? 'bg-orange-500' : 'bg-slate-400'}`}>
                                        {expert.name.substring(0, 2)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1" title={expert.name}>{expert.name}</h4>
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-400">
                                            <span>{expert.matricula}</span>
                                            <span>•</span>
                                            <span>{expert.login}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${expert.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {expert.active ? 'Ativo' : 'Inativo'}
                                </div>
                            </div>

                            <div className="text-xs text-slate-500 mb-4 font-medium flex items-center gap-1.5">
                                <span className="font-bold text-slate-300 uppercase">Supervisor:</span>
                                {expert.supervisor || 'N/A'}
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex gap-2">
                                <button
                                    onClick={() => handleEdit(expert)}
                                    className="flex-1 py-2 rounded-xl bg-slate-50 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors uppercase tracking-wider"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(expert)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors ${expert.active ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-500 hover:bg-green-100'}`}
                                    title={expert.active ? "Desativar" : "Ativar"}
                                >
                                    <Power size={14} />
                                    {expert.active ? 'DESATIVAR' : 'ATIVAR'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ExpertFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingExpert}
                supervisors={supervisors}
            />
        </section>
    );
};
