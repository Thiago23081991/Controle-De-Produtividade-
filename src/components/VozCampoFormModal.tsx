import React, { useState, useEffect } from 'react';
import { X, Phone, Loader2, MapPin, Building2, Smartphone } from 'lucide-react';
import { useVozCampo } from '../contexts/VozCampoContext';

interface VozCampoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Tecnico {
    nome: string;
    celular: string;
    regiao: string;
    empresa: string;
}

const TECNICOS: Tecnico[] = [
    // SUVINIL - TÉCNICOS
    { nome: 'ALEX PADILHA DOS SANTOS', celular: '(48)99162-3896', regiao: 'Santa Catarina (Florianópolis e Região Metropolitana)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'ALMIR MARQUES', celular: '(21)99055-2851', regiao: 'Rio de Janeiro (Região Metropolitana)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'ANTONIO URBANO DA SILVA JÚNIOR', celular: '(34)99926-5352', regiao: 'Minas Gerais (Uberlândia/Triângulo Mineiro)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'BRUNO KIRSCHKE DE BARROS', celular: '(51)99806-0458', regiao: 'Rio Grande do Sul (Porto Alegre e Região Metropolitana)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'CARLOS ALBERTO LIMA', celular: '(71)99671-3756', regiao: 'Bahia (Salvador e Região Metropolitana)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'CLAUDINEI APARECIDO MENDES DA SILVA', celular: '(11)99649-3089', regiao: 'São Paulo (Região Metropolitana)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'DOUGLAS RAFAEL GOMES DA CRUZ', celular: '(44)99152-6443', regiao: 'Paraná (Maringá/Campo Mourão/Umuarama)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'ENDERSON DE SENA SANTOS', celular: '(31)99981-4304', regiao: 'Minas Gerais (Belo Horizonte e Região Metropolitana)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'EVANDRO AFONSO DE AZEVEDO', celular: '(21)96754-7316', regiao: 'Rio de Janeiro (Região Metropolitana)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'EVANDRO MARCONATO', celular: '(11)99614-2292', regiao: 'São Paulo (Região Metropolitana)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'FERNANDO CESAR CANAVAN', celular: '(15)99614-4516', regiao: 'São Paulo (Sorocaba/Itapetininga)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'FILIPE MILTON SALEME SANTOS', celular: '(11)99656-7565', regiao: 'São Paulo (Região Metropolitana)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'GIOVANNI RICARDO VICENZI', celular: '(54)99684-4868', regiao: 'Rio Grande do Sul (Caxias do Sul/Passo Fundo)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'JHONES FAGUNDES DOS SANTOS', celular: '(18)99812-6825', regiao: 'São Paulo (Presidente Prudente/Araçatuba/Birigui)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'LUCAS DA COSTA MOREIRA', celular: '(62)99631-3055', regiao: 'Goiás (Goiânia e Região Metropolitana)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'MAX MAURO LIMA DA BOA MORTE', celular: '(27)99645-5649', regiao: 'Espírito Santo (Vitória e Região Metropolitana)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'RENATO HALICK JUNIOR', celular: '(41)99982-1181', regiao: 'Paraná (Curitiba e Região Metropolitana)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'RODOLFO FEDERICO ARANDA', celular: '(16)99770-5122', regiao: 'São Paulo (Ribeirão Preto/Araraquara/São Carlos/Franca)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'SAMUEL IDAVIR DOMINGOS', celular: '(31)99721-1563', regiao: 'Minas Gerais (Belo Horizonte e Região Metropolitana)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'THIAGO DE SOUZA ANGELO', celular: '(21)99961-3794', regiao: 'Rio de Janeiro (Região Metropolitana)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'WARLINSON DE JESUS ANDRADE', celular: '(37)99983-8397', regiao: 'Minas Gerais (Divinópolis/Centro-Oeste)', empresa: 'SUVINIL - TÉCNICOS' },
    { nome: 'FERNANDO BARBERY ARGUELHO', celular: '(11)91419-0093', regiao: 'São Paulo (Região Metropolitana)', empresa: 'SUVINIL - TÉCNICOS' },
    // SW - TÉCNICOS
    { nome: 'ALEXANDRO RIBEIRO VINEZOF', celular: '(71)8143-7595', regiao: 'Bahia (Salvador e Região Metropolitana)', empresa: 'SW - TÉCNICOS' },
    { nome: 'ANDERSON BARBOSA OLIVEIRA', celular: '(31)8481-7558', regiao: 'Minas Gerais (Belo Horizonte e Região Metropolitana)', empresa: 'SW - TÉCNICOS' },
    { nome: 'ANOEL MACEDO JUNIOR', celular: '(27)99848-9748', regiao: 'Espírito Santo (Vitória e Região Metropolitana)', empresa: 'SW - TÉCNICOS' },
    { nome: 'ANTONIO MARCOS DOS SANTOS', celular: '(21)99252-9908', regiao: 'Rio de Janeiro (Região Metropolitana)', empresa: 'SW - TÉCNICOS' },
    { nome: 'CLAUDENIR CARVALHO DE SOUSA', celular: '(85)9172-0322', regiao: 'Ceará (Fortaleza e Região Metropolitana)', empresa: 'SW - TÉCNICOS' },
    { nome: 'EWERTON LEITE DA SILVA', celular: '(11)99185-4009', regiao: 'São Paulo (Região Metropolitana)', empresa: 'SW - TÉCNICOS' },
    { nome: 'FABIO CAMPOS SANTANNA', celular: '(16)99992-0518', regiao: 'São Paulo (Ribeirão Preto/Araraquara/São Carlos/Franca)', empresa: 'SW - TÉCNICOS' },
    { nome: 'JEFFERSON ANACLETO GODOY XAVIER', celular: '(61)9555-5137', regiao: 'Distrito Federal / Entorno', empresa: 'SW - TÉCNICOS' },
    { nome: 'RONALDO NICCHIO MOREIRA', celular: '(41)8866-4092', regiao: 'Paraná (Curitiba e Região Metropolitana)', empresa: 'SW - TÉCNICOS' },
    { nome: 'SIDNEY ARTIOLLI JUNIOR', celular: '(16)99176-5135', regiao: 'São Paulo (Ribeirão Preto/Araraquara/São Carlos/Franca)', empresa: 'SW - TÉCNICOS' },
    { nome: 'WILLIAM TEIXEIRA DA SILVA', celular: '(81)8147-5306', regiao: 'Pernambuco (Recife e Região Metropolitana)', empresa: 'SW - TÉCNICOS' },
    // SUVINIL - TERCEIRO
    { nome: 'LUILA CRISTINE DINIZ COSTA', celular: '(98)8352-6763', regiao: 'Maranhão (São Luís e Região Metropolitana)', empresa: 'SUVINIL - TERCEIRO' },
    { nome: 'VITOR MATHEUS MOREIRA FONSECA', celular: '(55)9157-5574', regiao: 'Rio Grande do Sul (Santa Maria/Uruguaiana/Ijuí)', empresa: 'SUVINIL - TERCEIRO' },
];

// Empresas com cores distintas
const EMPRESA_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    'SUVINIL - TÉCNICOS': {
        bg: 'rgba(16,185,129,0.08)',
        border: 'rgba(16,185,129,0.3)',
        text: '#059669',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    'SW - TÉCNICOS': {
        bg: 'rgba(59,130,246,0.08)',
        border: 'rgba(59,130,246,0.3)',
        text: '#2563eb',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    'SUVINIL - TERCEIRO': {
        bg: 'rgba(245,158,11,0.08)',
        border: 'rgba(245,158,11,0.3)',
        text: '#d97706',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
};

const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const FUNCAO_OPTIONS = [
    'Técnico Suvinil',
    'Técnico Sherwin',
    'Técnico da Distribuição',
    'Consultor',
    'Técnico Representação / Promotor',
];

const SOLICITACAO_OPTIONS_DEFAULT = [
    'Apoio no caso (Geral)',
    'Verificar andamento do caso',
    'Entender o caso',
    'Apoio com Laboratório',
    'Direcionamento ao Laboratório',
    'Ajustar Patologia',
    'Ajustar alguma informação do caso',
    'Verificar o atraso do Caso',
    'Prioridade ou andamento no chamado',
    'Verificar pagamento',
    'Verificar data do pagamento',
    'Apoio com atualização de Senha do Selfcolor',
    'Apoio com Selfcolor',
    'Apoio com Fórmula',
    'Apoio com Cadastro NovoSelf',
    'Apoio com Contrato do Novo Self',
    'Apoio com confirmação de Fórmula',
    'Ajuda com os 11 passos',
    'Ajuda com o Preenchimento dos 11 passos',
    'Ajuste de pagamento no Portal do Cliente em NC',
    'Ajuste de pagamento no Portal do Cliente em ND',
    'Atribuição de caso ao nome dele (a)'
];

const SOLICITACAO_OPTIONS_PROMOTOR = [
    'Apoio com Cadastro de OP',
    'Comunicação de nova Evidência(s) no caso',
    'Comunicação da Evidência Faltante/Pendente no caso',
];

const inputClass =
    'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:font-normal placeholder:text-slate-300';

const selectClass =
    'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all appearance-none cursor-pointer';

// Agrupar técnicos por empresa para o select
const grouped = TECNICOS.reduce<Record<string, Tecnico[]>>((acc, t) => {
    if (!acc[t.empresa]) acc[t.empresa] = [];
    acc[t.empresa].push(t);
    return acc;
}, {});

export const VozCampoFormModal: React.FC<VozCampoFormModalProps> = ({ isOpen, onClose }) => {
    const { addRecord, isSaving } = useVozCampo();

    const [date, setDate] = useState(getTodayString());
    const [funcao, setFuncao] = useState('');
    const [subCampo, setSubCampo] = useState('');
    const [nomeTecnico, setNomeTecnico] = useState('');
    const [selectedTecnico, setSelectedTecnico] = useState<Tecnico | null>(null);
    const [solicitacao, setSolicitacao] = useState('');
    const [tempoLigacao, setTempoLigacao] = useState('');
    const [quantosCasos, setQuantosCasos] = useState<number | ''>('');

    useEffect(() => {
        if (isOpen) {
            setDate(getTodayString());
            setFuncao('');
            setSubCampo('');
            setNomeTecnico('');
            setSelectedTecnico(null);
            setSolicitacao('');
            setTempoLigacao('');
            setQuantosCasos('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleTecnicoChange = (nome: string) => {
        setNomeTecnico(nome);
        const found = TECNICOS.find(t => t.nome === nome) || null;
        setSelectedTecnico(found);
        // Auto-preenche sub-campo com a região do técnico, se não preenchido ainda
        if (found && !subCampo.trim()) {
            setSubCampo(found.regiao);
        }
    };

    const isConsultor = funcao === 'Consultor' || funcao === 'Técnico da Distribuição' || funcao === 'Técnico Representação / Promotor';
    const isPromotor = funcao === 'Técnico Representação / Promotor';
    const solicitacaoOptions = isPromotor ? SOLICITACAO_OPTIONS_PROMOTOR : SOLICITACAO_OPTIONS_DEFAULT;

    const isValid =
        funcao &&
        subCampo.trim() &&
        (isConsultor || nomeTecnico.trim()) &&
        solicitacao.trim() &&
        tempoLigacao.trim() &&
        quantosCasos !== '' &&
        Number(quantosCasos) >= 0;

    // Limpa a solicitação ao trocar de função para evitar valor inválido
    const handleFuncaoChange = (val: string) => {
        setFuncao(val);
        setSolicitacao('');
        setNomeTecnico('');
        setSelectedTecnico(null);
        setSubCampo('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        const success = await addRecord({
            date,
            funcao,
            sub_campo: subCampo.trim(),
            nome_tecnico_consultor: nomeTecnico.trim(),
            solicitacao: solicitacao.trim(),
            tempo_ligacao: tempoLigacao.trim(),
            quantos_casos_ligacao: Number(quantosCasos),
        });

        if (success) onClose();
    };

    const empresaStyle = selectedTecnico ? EMPRESA_COLORS[selectedTecnico.empresa] : null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300">

                {/* Header */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 opacity-10">
                        <Phone size={120} className="text-white" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-2xl">
                                <Phone size={22} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Registrar Ligação</h2>
                                <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest">Voz de Campo</p>
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
                <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">

                    {/* Data */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Data
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    {/* Função */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Função <span className="text-emerald-500">*</span>
                        </label>
                        <select
                            value={funcao}
                            onChange={e => handleFuncaoChange(e.target.value)}
                            required
                            className={selectClass}
                        >
                            <option value="">Selecione a função...</option>
                            {FUNCAO_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Nome Técnico / Consultor — agora SELECT com grupos ou input livre para Consultor */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Nome {isPromotor ? 'Promotor / Representante' : 'Técnico / Consultor'} {!isConsultor && <span className="text-emerald-500">*</span>}
                            {isConsultor && !isPromotor && <span className="text-slate-400 normal-case font-normal"> (opcional — digite livremente)</span>}
                            {isPromotor && <span className="text-slate-400 normal-case font-normal"> (opcional — digite livremente)</span>}
                        </label>
                        {isConsultor ? (
                            <input
                                type="text"
                                value={nomeTecnico}
                                onChange={e => setNomeTecnico(e.target.value)}
                                placeholder="Digite o nome do consultor..."
                                className={inputClass}
                            />
                        ) : (
                            <select
                                value={nomeTecnico}
                                onChange={e => handleTecnicoChange(e.target.value)}
                                required
                                className={selectClass}
                            >
                                <option value="">Selecione o técnico...</option>
                                {Object.entries(grouped).map(([empresa, tecnicos]) => (
                                    <optgroup key={empresa} label={`— ${empresa} —`}>
                                        {tecnicos.map(t => (
                                            <option key={t.nome} value={t.nome}>{t.nome}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        )}

                        {/* Card de informações automáticas do técnico */}
                        {selectedTecnico && (
                            <div
                                className="mt-3 rounded-2xl p-4 border transition-all duration-300"
                                style={{
                                    backgroundColor: empresaStyle?.bg,
                                    borderColor: empresaStyle?.border,
                                }}
                            >
                                {/* Badge Empresa */}
                                <div className="flex items-center justify-between mb-3">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${empresaStyle?.badge}`}
                                    >
                                        <Building2 size={10} />
                                        {selectedTecnico.empresa}
                                    </span>
                                </div>

                                {/* Celular */}
                                <div className="flex items-center gap-2 mb-2">
                                    <div
                                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: empresaStyle?.border }}
                                    >
                                        <Smartphone size={13} style={{ color: empresaStyle?.text }} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Celular</p>
                                        <p className="text-sm font-black" style={{ color: empresaStyle?.text }}>
                                            {selectedTecnico.celular}
                                        </p>
                                    </div>
                                </div>

                                {/* Região */}
                                <div className="flex items-start gap-2">
                                    <div
                                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
                                        style={{ backgroundColor: empresaStyle?.border }}
                                    >
                                        <MapPin size={13} style={{ color: empresaStyle?.text }} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Região</p>
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-snug">
                                            {selectedTecnico.regiao}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sub-Campo */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Sub-Campo <span className="text-emerald-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={subCampo}
                            onChange={e => setSubCampo(e.target.value)}
                            placeholder="Ex: Região Sul, Distribuidor XYZ..."
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* Solicitação */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Motivo / Solicitação <span className="text-emerald-500">*</span>
                        </label>
                        <select
                            value={solicitacao}
                            onChange={e => setSolicitacao(e.target.value)}
                            required
                            className={selectClass}
                        >
                            <option value="">Selecione o motivo...</option>
                            {solicitacaoOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tempo de Ligação + Casos em Ligação — side by side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Tempo de Ligação <span className="text-emerald-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={tempoLigacao}
                                onChange={e => setTempoLigacao(e.target.value)}
                                placeholder="Ex: 00:15:00"
                                required
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Qtd. Casos <span className="text-emerald-500">*</span>
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={quantosCasos}
                                onChange={e => setQuantosCasos(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="0"
                                required
                                className={inputClass}
                            />
                        </div>
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
                            disabled={isSaving || !isValid}
                            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Phone size={16} />}
                            {isSaving ? 'Salvando...' : 'Registrar Ligação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
