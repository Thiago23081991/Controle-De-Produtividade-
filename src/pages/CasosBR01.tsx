import React, { useState } from 'react';
import { Plus, Trash2, PackageSearch, CheckCircle2, X, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ProdutoReclamado {
    id: number;
    nome: string;
    quantidade: string;
}

interface CasosBR01Form {
    numeroCaso: string;
    testouEmBR0Y: string;
    produtos: ProdutoReclamado[];
}

// ─── Produtos pré-definidos (primeiros 5) ─────────────────────────────────────
const PRODUTOS_PADRAO = [
    'Tinta Acrílica',
    'Tinta Esmalte',
    'Verniz',
    'Massa Corrida',
    'Selador',
];

const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

let nextId = 6;

// ─── Componente Principal ─────────────────────────────────────────────────────
export const CasosBR01: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedCases, setSavedCases] = useState<(CasosBR01Form & { id: number; savedAt: string })[]>([]);

    // Estado do formulário
    const [numeroCaso, setNumeroCaso] = useState('');
    const [testouEmBR0Y, setTestouEmBR0Y] = useState('');
    const [produtos, setProdutos] = useState<ProdutoReclamado[]>(
        PRODUTOS_PADRAO.map((nome, i) => ({ id: i + 1, nome, quantidade: '' }))
    );
    const [produtosExtras, setProdutosExtras] = useState<ProdutoReclamado[]>([]);

    const resetForm = () => {
        setNumeroCaso('');
        setTestouEmBR0Y('');
        setProdutos(PRODUTOS_PADRAO.map((nome, i) => ({ id: i + 1, nome, quantidade: '' })));
        setProdutosExtras([]);
    };

    const handleOpenForm = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
    };

    // Atualiza quantidade dos produtos padrão
    const updateProdutoQtd = (id: number, quantidade: string) => {
        setProdutos(prev => prev.map(p => p.id === id ? { ...p, quantidade } : p));
    };

    // Adiciona produto extra
    const addProdutoExtra = () => {
        const newId = nextId++;
        setProdutosExtras(prev => [...prev, { id: newId, nome: '', quantidade: '' }]);
    };

    // Atualiza produto extra
    const updateProdutoExtra = (id: number, field: 'nome' | 'quantidade', value: string) => {
        setProdutosExtras(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    // Remove produto extra
    const removeProdutoExtra = (id: number) => {
        setProdutosExtras(prev => prev.filter(p => p.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!numeroCaso.trim() || !testouEmBR0Y) return;

        setIsSaving(true);
        await new Promise(r => setTimeout(r, 600)); // Simula delay de salvamento

        const allProdutos = [
            ...produtos.filter(p => p.quantidade.trim() !== ''),
            ...produtosExtras.filter(p => p.nome.trim() !== ''),
        ];

        setSavedCases(prev => [{
            id: Date.now(),
            savedAt: getTodayString(),
            numeroCaso: numeroCaso.trim(),
            testouEmBR0Y,
            produtos: allProdutos,
        }, ...prev]);

        setIsSaving(false);
        setIsFormOpen(false);
        resetForm();
    };

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

            {/* ── Lista de Casos Salvos ─────────────────────────────────────── */}
            {savedCases.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <h3 className="text-sm font-black italic uppercase tracking-wider text-slate-900 dark:text-white">
                            Casos BR01 Registrados
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {savedCases.length} caso(s) registrado(s)
                        </p>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {savedCases.map(c => (
                            <CasoBR01Card key={c.id} caso={c} onDelete={() => setSavedCases(prev => prev.filter(x => x.id !== c.id))} />
                        ))}
                    </div>
                </div>
            )}

            {savedCases.length === 0 && (
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">

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

                        {/* Formulário com scroll */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">

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

                            {/* Produtos Reclamados */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Produtos Reclamados
                                    </label>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                        Informe a quantidade de cada produto
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {/* Produtos Padrão (5 fixos) */}
                                    {produtos.map(produto => (
                                        <div key={produto.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                                            <div className="flex-1">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    {produto.nome}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Qtd.</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={produto.quantidade}
                                                    onChange={e => updateProdutoQtd(produto.id, e.target.value)}
                                                    placeholder="0"
                                                    className="w-20 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg py-2 px-3 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 outline-none transition-all text-center"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {/* Produtos Extras (adicionados pelo botão +) */}
                                    {produtosExtras.map((produto, index) => (
                                        <div
                                            key={produto.id}
                                            className="flex items-center gap-3 bg-violet-50 dark:bg-violet-900/10 rounded-xl p-3 border border-violet-100 dark:border-violet-800/30 animate-in slide-in-from-top-2 duration-200"
                                        >
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={produto.nome}
                                                    onChange={e => updateProdutoExtra(produto.id, 'nome', e.target.value)}
                                                    placeholder={`Produto extra ${index + 1}...`}
                                                    className="w-full bg-white dark:bg-slate-700 border border-violet-200 dark:border-violet-700/50 rounded-lg py-2 px-3 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 outline-none transition-all placeholder:font-normal placeholder:text-slate-300"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Qtd.</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={produto.quantidade}
                                                    onChange={e => updateProdutoExtra(produto.id, 'quantidade', e.target.value)}
                                                    placeholder="0"
                                                    className="w-20 bg-white dark:bg-slate-700 border border-violet-200 dark:border-violet-700/50 rounded-lg py-2 px-3 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 outline-none transition-all text-center"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeProdutoExtra(produto.id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Remover produto"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Botão para adicionar mais produtos */}
                                <button
                                    type="button"
                                    onClick={addProdutoExtra}
                                    className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-violet-200 dark:border-violet-800/40 text-violet-500 dark:text-violet-400 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/10 font-black text-xs uppercase tracking-widest transition-all group"
                                >
                                    <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-800/40 transition-colors">
                                        <Plus size={14} />
                                    </div>
                                    Adicionar Produto
                                </button>
                            </div>

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

// ─── Card de Caso Salvo ───────────────────────────────────────────────────────
interface CasoBR01CardProps {
    caso: {
        id: number;
        savedAt: string;
        numeroCaso: string;
        testouEmBR0Y: string;
        produtos: ProdutoReclamado[];
    };
    onDelete: () => void;
}

const CasoBR01Card: React.FC<CasoBR01CardProps> = ({ caso, onDelete }) => {
    const [expanded, setExpanded] = useState(false);

    const testouColor =
        caso.testouEmBR0Y === 'Sim' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
        caso.testouEmBR0Y === 'Não' ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' :
        'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400';

    return (
        <div className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <PackageSearch size={18} className="text-violet-600 dark:text-violet-400" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                            {caso.numeroCaso}
                        </span>
                        {caso.testouEmBR0Y && (
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${testouColor}`}>
                                BR0Y: {caso.testouEmBR0Y}
                            </span>
                        )}
                        {caso.produtos.length > 0 && (
                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                                {caso.produtos.length} produto(s)
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                        Registrado em {caso.savedAt.split('-').reverse().join('/')}
                    </p>
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
                    {caso.produtos.map(p => (
                        <div key={p.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{p.nome || '—'}</p>
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
