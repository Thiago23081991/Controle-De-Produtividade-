import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, PackageSearch, CheckCircle2, X, ChevronDown, ChevronUp, Download, Loader2, User, Search } from 'lucide-react';
import { exportCasosBR01ToExcel } from '../utils/excelExport';
import { casosBR01Service } from '../services/casosBR01Service';
import { CasosBR01Record } from '../types';
import { useAuth } from '../contexts/AuthContext';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ProdutoReclamado {
    id: number;
    nome: string;
    quantidade: string;
}

const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

let nextId = 2;

const newProduto = (): ProdutoReclamado => ({ id: nextId++, nome: '', quantidade: '' });

// ─── Componente Principal ─────────────────────────────────────────────────────
export const CasosBR01: React.FC = () => {
    const { currentUser, isAdmin } = useAuth();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [savedCases, setSavedCases] = useState<CasosBR01Record[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Estado do formulário
    const [numeroCaso, setNumeroCaso] = useState('');
    const [testouEmBR0Y, setTestouEmBR0Y] = useState('');
    const [produtos, setProdutos] = useState<ProdutoReclamado[]>([{ id: 1, nome: '', quantidade: '' }]);

    const loadCases = useCallback(async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            console.log('[BR01] Carregando casos do Supabase...');
            const data = await casosBR01Service.getAllCases();
            console.log('[BR01] Casos carregados:', data);
            setSavedCases(data);
        } catch (err: any) {
            console.error('[BR01] Erro ao carregar casos:', err);
            setErrorMsg(`Erro ao carregar: ${err?.message || JSON.stringify(err)}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCases();
    }, [loadCases]);

    const resetForm = () => {
        setNumeroCaso('');
        setTestouEmBR0Y('');
        setProdutos([{ id: 1, nome: '', quantidade: '' }]);
    };

    const handleOpenForm = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
    };

    // Adiciona nova linha de produto
    const addProduto = () => {
        setProdutos(prev => [...prev, newProduto()]);
    };

    // Atualiza campo de um produto
    const updateProduto = (id: number, field: 'nome' | 'quantidade', value: string) => {
        setProdutos(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    // Remove um produto (mantém pelo menos 1)
    const removeProduto = (id: number) => {
        setProdutos(prev => prev.length > 1 ? prev.filter(p => p.id !== id) : prev);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!numeroCaso.trim()) return;

        setIsSaving(true);
        setSaveErrorMsg(null);
        try {
            const produtosFilled = produtos
                .filter(p => p.nome.trim() !== '')
                .map(p => ({ nome: p.nome, quantidade: p.quantidade }));

            console.log('[BR01] Salvando caso:', { numero_caso: numeroCaso.trim(), testou_em_br0y: testouEmBR0Y, produtos: produtosFilled });

            const registradoPor = isAdmin ? 'Admin' : (currentUser?.name || 'Desconhecido');

            const newRecord = await casosBR01Service.addCase({
                numero_caso: numeroCaso.trim(),
                testou_em_br0y: testouEmBR0Y,
                produtos: produtosFilled,
                saved_at: getTodayString(),
                registrado_por: registradoPor,
            });

            console.log('[BR01] Registro salvo:', newRecord);

            if (newRecord) {
                setSavedCases(prev => [newRecord, ...prev]);
                setIsFormOpen(false);
                resetForm();
            } else {
                setSaveErrorMsg('Supabase não está configurado. Verifique as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
            }
        } catch (err: any) {
            console.error('[BR01] Erro ao salvar caso:', err);
            setSaveErrorMsg(`Erro ao salvar: ${err?.message || JSON.stringify(err)}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await casosBR01Service.deleteCase(id);
            setSavedCases(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Erro ao deletar caso BR01:', err);
        }
    };

    // Filtra os casos com base na busca
    const filteredCases = savedCases.filter(c => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const matchNumero = c.numero_caso?.toLowerCase().includes(q);
        const matchRegistrado = c.registrado_por?.toLowerCase().includes(q);
        const matchData = c.saved_at?.toLowerCase().includes(q);
        const matchProduto = c.produtos?.some(p => p.nome?.toLowerCase().includes(q));
        return matchNumero || matchRegistrado || matchData || matchProduto;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-10 duration-700">

            {/* ── Banner Hero ───────────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-slate-900 to-violet-950 rounded-[3rem] shadow-2xl p-8 md:p-12 border-4 border-violet-600 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="absolute -top-8 -right-8 opacity-5 pointer-events-none">
                    <PackageSearch size={200} className="text-violet-500" />
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600" />

                <div className="z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-violet-600/20 text-violet-400 px-4 py-1.5 rounded-full mb-4">
                        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Casos Especiais</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter">
                        Casos <span className="text-violet-400">BR01</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm mt-2">
                        Registro e acompanhamento de casos BR01 com produtos reclamados.
                    </p>
                </div>

                {/* Botão principal BR01 */}
                <div className="z-10">
                    <button
                        onClick={handleOpenForm}
                        className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all shadow-xl shadow-violet-900/50 active:scale-95 group"
                    >
                        <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-90 transition-transform duration-300">
                            <Plus size={20} />
                        </div>
                        BR01
                    </button>
                </div>
            </div>

            {/* ── Buscador de Casos ─────────────────────────────────────── */}
            {!isLoading && savedCases.length > 0 && (
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-violet-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Buscar por número do caso, produto, responsável ou data..."
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-500 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none transition-all placeholder:font-normal placeholder:text-slate-400 shadow-md"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-violet-600 transition-colors"
                            title="Limpar busca"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            )}

            {/* ── Erro de Carregamento ─────────────────────────────────────── */}
            {errorMsg && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X size={16} className="text-red-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-wider">Erro ao conectar com o banco de dados</p>
                        <p className="text-[11px] font-mono text-red-500 dark:text-red-400 mt-1 break-all">{errorMsg}</p>
                    </div>
                    <button
                        onClick={loadCases}
                        className="text-[10px] font-black text-red-600 hover:text-red-800 uppercase tracking-wider flex-shrink-0 underline"
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {/* ── Lista de Casos Salvos ─────────────────────────────────────── */}
            {isLoading && (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-50 dark:bg-violet-900/20 rounded-3xl mb-6 animate-pulse">
                        <Loader2 size={36} className="text-violet-400 animate-spin" />
                    </div>
                    <h3 className="text-base font-black uppercase tracking-widest text-slate-700 dark:text-white">
                        Carregando histórico...
                    </h3>
                </div>
            )}

            {!isLoading && savedCases.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-black italic uppercase tracking-wider text-slate-900 dark:text-white">
                                Casos BR01 Registrados
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {searchQuery.trim()
                                    ? <><span className="text-violet-500">{filteredCases.length}</span> de {savedCases.length} caso(s)
                                    </>
                                    : <>{savedCases.length} caso(s) registrado(s)</>}
                            </p>
                        </div>
                        <button
                            onClick={() => exportCasosBR01ToExcel(savedCases)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 active:scale-95"
                            title="Exportar para Excel"
                        >
                            <Download size={16} />
                            Excel
                        </button>
                    </div>

                    {/* Nenhum resultado para a busca */}
                    {filteredCases.length === 0 && searchQuery.trim() && (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4">
                                <Search size={24} className="text-slate-400" />
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                Nenhum caso encontrado
                            </p>
                            <p className="text-[11px] font-bold text-slate-400 mt-1">
                                Tente buscar por outro termo ou{' '}
                                <button onClick={() => setSearchQuery('')} className="text-violet-500 underline">limpar a busca</button>.
                            </p>
                        </div>
                    )}

                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {filteredCases.map(c => (
                            <CasoBR01Card
                                key={c.id}
                                caso={c}
                                onDelete={() => c.id && handleDelete(c.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && savedCases.length === 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-50 dark:bg-violet-900/20 rounded-3xl mb-6">
                        <PackageSearch size={36} className="text-violet-400" />
                    </div>
                    <h3 className="text-base font-black uppercase tracking-widest text-slate-700 dark:text-white">
                        Nenhum caso BR01 registrado
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                        Clique em <span className="text-violet-500">BR01</span> no topo para adicionar um novo caso.
                    </p>
                </div>
            )}

            {/* ── Modal do Formulário ───────────────────────────────────────── */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-8 overflow-y-auto animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300 flex flex-col mb-8">

                        {/* Header do Modal */}
                        <div className="bg-gradient-to-br from-violet-600 to-purple-700 p-8 relative overflow-hidden flex-shrink-0">
                            <div className="absolute -top-4 -right-4 opacity-10">
                                <PackageSearch size={120} className="text-white" />
                            </div>
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/20 p-3 rounded-2xl">
                                        <PackageSearch size={22} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white tracking-tight">Registrar Caso BR01</h2>
                                        <p className="text-violet-200 text-[10px] font-bold uppercase tracking-widest">Preencha os dados do caso</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Formulário */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">

                            {/* Número do Caso */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Número do Caso <span className="text-violet-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={numeroCaso}
                                    onChange={e => setNumeroCaso(e.target.value)}
                                    placeholder="Ex: 2024-123456"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 outline-none transition-all placeholder:font-normal placeholder:text-slate-300"
                                />
                            </div>

                            {/* Testou em BR0Y */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Testou Em BR0Y
                                </label>
                                <div className="flex gap-3">
                                    {(['Sim', 'Não', 'Parcial'] as const).map(opt => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setTestouEmBR0Y(opt)}
                                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                                                testouEmBR0Y === opt
                                                    ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30'
                                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-300 hover:text-violet-600'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Produtos Reclamados — todos livres */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Produtos Reclamados
                                    </label>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                        Nome do produto + quantidade
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {produtos.map((produto, index) => (
                                        <div
                                            key={produto.id}
                                            className="flex items-center gap-3 bg-violet-50 dark:bg-violet-900/10 rounded-xl p-3 border border-violet-100 dark:border-violet-800/30 animate-in slide-in-from-top-2 duration-200"
                                        >
                                            {/* Número da linha */}
                                            <span className="text-[10px] font-black text-violet-400 w-5 text-center flex-shrink-0">
                                                {index + 1}
                                            </span>

                                            {/* Nome do produto */}
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={produto.nome}
                                                    onChange={e => updateProduto(produto.id, 'nome', e.target.value)}
                                                    placeholder={`Nome do produto ${index + 1}...`}
                                                    className="w-full bg-white dark:bg-slate-700 border border-violet-200 dark:border-violet-700/50 rounded-lg py-2 px-3 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 outline-none transition-all placeholder:font-normal placeholder:text-slate-300"
                                                />
                                            </div>

                                            {/* Quantidade */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Qtd.</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={produto.quantidade}
                                                    onChange={e => updateProduto(produto.id, 'quantidade', e.target.value)}
                                                    placeholder="0"
                                                    className="w-20 bg-white dark:bg-slate-700 border border-violet-200 dark:border-violet-700/50 rounded-lg py-2 px-3 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 outline-none transition-all text-center"
                                                />
                                            </div>

                                            {/* Remover (oculto se só tiver 1) */}
                                            <button
                                                type="button"
                                                onClick={() => removeProduto(produto.id)}
                                                disabled={produtos.length === 1}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-20 disabled:cursor-not-allowed flex-shrink-0"
                                                title="Remover produto"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Botão + Adicionar Produto */}
                                <button
                                    type="button"
                                    onClick={addProduto}
                                    className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-violet-200 dark:border-violet-800/40 text-violet-500 dark:text-violet-400 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/10 font-black text-xs uppercase tracking-widest transition-all group"
                                >
                                    <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-800/40 transition-colors">
                                        <Plus size={14} />
                                    </div>
                                    Adicionar Produto
                                </button>
                            </div>

                            {/* Erro de salvar */}
                            {saveErrorMsg && (
                                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                                    <X size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-[11px] font-bold text-red-600 dark:text-red-400 break-all">{saveErrorMsg}</p>
                                </div>
                            )}

                            {/* Botões de Ação */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving || !numeroCaso.trim()}
                                    className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900/30 active:scale-95"
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <CheckCircle2 size={16} />
                                    )}
                                    {isSaving ? 'Salvando...' : 'Registrar Caso BR01'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Card de Caso Salvo ─────────────────────────────────────────────────────
interface CasoBR01CardProps {
    caso: {
        id?: string;
        saved_at: string;
        numero_caso: string;
        testou_em_br0y: string;
        produtos: { id?: number; nome: string; quantidade: string }[];
        registrado_por?: string;
    };
    onDelete: () => void;
}

const CasoBR01Card: React.FC<CasoBR01CardProps> = ({ caso, onDelete }) => {
    const [expanded, setExpanded] = useState(false);

    const testouColor =
        caso.testou_em_br0y === 'Sim'     ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
        caso.testou_em_br0y === 'Não'     ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' :
        caso.testou_em_br0y === 'Parcial' ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400' :
        '';

    return (
        <div className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <PackageSearch size={18} className="text-violet-600 dark:text-violet-400" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                            {caso.numero_caso}
                        </span>
                        {caso.testou_em_br0y && (
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${testouColor}`}>
                                BR0Y: {caso.testou_em_br0y}
                            </span>
                        )}
                        {caso.produtos.length > 0 && (
                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                                {caso.produtos.length} produto(s)
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Registrado em {caso.saved_at.split('-').reverse().join('/')}
                        </p>
                        {caso.registrado_por && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                <User size={9} />
                                {caso.registrado_por}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {caso.produtos.length > 0 && (
                        <button
                            onClick={() => setExpanded(v => !v)}
                            className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                            title={expanded ? 'Recolher produtos' : 'Ver produtos'}
                        >
                            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    )}
                    <button
                        onClick={onDelete}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remover caso"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Produtos expandidos */}
            {expanded && caso.produtos.length > 0 && (
                <div className="mt-4 ml-14 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-in slide-in-from-top-2 duration-200">
                    {caso.produtos.map((p, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">{p.nome || '—'}</p>
                            <p className="text-lg font-black text-violet-600 dark:text-violet-400 mt-1">
                                {p.quantidade || '0'}
                                <span className="text-[10px] text-slate-400 font-bold ml-1">un.</span>
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
