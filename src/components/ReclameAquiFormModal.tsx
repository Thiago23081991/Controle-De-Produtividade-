import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2, Save, MessageSquare } from 'lucide-react';
import { useReclameAqui } from '../contexts/ReclameAquiContext';
import { ReclameAquiRecord } from '../types';

interface ReclameAquiFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingRecord?: ReclameAquiRecord | null;
}

const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const ReclameAquiFormModal: React.FC<ReclameAquiFormModalProps> = ({ isOpen, onClose, editingRecord }) => {
    const { addRecord, updateRecord, isSaving } = useReclameAqui();

    const [registroRa, setRegistroRa] = useState('');
    const [notaFiscal, setNotaFiscal] = useState('');
    const [dataPostagem, setDataPostagem] = useState(getTodayString());
    const [consumidor, setConsumidor] = useState('');
    const [entrada, setEntrada] = useState('');
    const [statusAtual, setStatusAtual] = useState('Em Tratativa');
    const [chamado, setChamado] = useState('');
    const [email, setEmail] = useState('');
    const [dataContato, setDataContato] = useState('');
    const [respostaPublica, setRespostaPublica] = useState('');
    const [patologiaCausa, setPatologiaCausa] = useState('');
    const [voltariaFazerNegocio, setVoltariaFazerNegocio] = useState('');
    const [resolvido, setResolvido] = useState('');
    const [notaAvaliacao, setNotaAvaliacao] = useState('');
    const [moderacao, setModeracao] = useState('');
    const [visitaTecnica, setVisitaTecnica] = useState('');
    const [dataReplica, setDataReplica] = useState('');
    const [dataTreplica, setDataTreplica] = useState('');
    const [procedente, setProcedente] = useState('');
    const [mo, setMo] = useState('');
    const [produto, setProduto] = useState('');

    useEffect(() => {
        if (editingRecord) {
            setRegistroRa(editingRecord.registro_ra || '');
            setNotaFiscal(editingRecord.nota_fiscal || '');
            setDataPostagem(editingRecord.data_postagem || getTodayString());
            setConsumidor(editingRecord.consumidor || '');
            setEntrada(editingRecord.entrada || '');
            setStatusAtual(editingRecord.status_atual || 'Em Tratativa');
            setChamado(editingRecord.chamado || '');
            setEmail(editingRecord.email || '');
            setDataContato(editingRecord.data_contato || '');
            setRespostaPublica(editingRecord.resposta_publica || '');
            setPatologiaCausa(editingRecord.patologia_causa || '');
            setVoltariaFazerNegocio(editingRecord.voltaria_fazer_negocio || '');
            setResolvido(editingRecord.resolvido || '');
            setNotaAvaliacao(editingRecord.nota_avaliacao || '');
            setModeracao(editingRecord.moderacao || '');
            setVisitaTecnica(editingRecord.visita_tecnica || '');
            setDataReplica(editingRecord.data_replica || '');
            setDataTreplica(editingRecord.data_treplica || '');
            setProcedente(editingRecord.procedente || '');
            setMo(editingRecord.mo || '');
            setProduto(editingRecord.produto || '');
        } else if (isOpen) {
            setRegistroRa('');
            setNotaFiscal('');
            setDataPostagem(getTodayString());
            setConsumidor('');
            setEntrada('');
            setStatusAtual('Em Tratativa');
            setChamado('');
            setEmail('');
            setDataContato('');
            setRespostaPublica('');
            setPatologiaCausa('');
            setVoltariaFazerNegocio('');
            setResolvido('');
            setNotaAvaliacao('');
            setModeracao('');
            setVisitaTecnica('');
            setDataReplica('');
            setDataTreplica('');
            setProcedente('');
            setMo('');
            setProduto('');
        }
    }, [editingRecord, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: Omit<ReclameAquiRecord, 'id' | 'created_at'> = {
            registro_ra: registroRa.trim(),
            nota_fiscal: notaFiscal.trim(),
            data_postagem: dataPostagem.trim(),
            consumidor: consumidor.trim(),
            entrada: entrada.trim(),
            status_atual: statusAtual.trim(),
            chamado: chamado.trim(),
            email: email.trim(),
            data_contato: dataContato.trim(),
            resposta_publica: respostaPublica.trim(),
            patologia_causa: patologiaCausa.trim(),
            voltaria_fazer_negocio: voltariaFazerNegocio.trim(),
            resolvido: resolvido.trim(),
            nota_avaliacao: notaAvaliacao.trim(),
            moderacao: moderacao.trim(),
            visita_tecnica: visitaTecnica.trim(),
            data_replica: dataReplica.trim(),
            data_treplica: dataTreplica.trim(),
            procedente: procedente.trim(),
            mo: mo.trim(),
            produto: produto.trim(),
        };

        let success = false;
        if (editingRecord?.id) {
            success = await updateRecord(editingRecord.id, payload);
        } else {
            success = await addRecord(payload);
        }

        if (success) onClose();
    };

    const inputClass = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:border-red-400 outline-none transition-all";
    const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-3xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in duration-300">

                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-2xl">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight">
                                {editingRecord ? 'Editar Caso Reclame Aqui' : 'Registrar Caso Reclame Aqui'}
                            </h2>
                            <p className="text-red-100 text-[10px] font-bold uppercase tracking-widest">
                                Atendimento e Tratativa RA
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                        {/* Registro R.A. */}
                        <div>
                            <label className={labelClass}>Registro R.A. <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={registroRa}
                                onChange={e => setRegistroRa(e.target.value)}
                                placeholder="Ex: 198273645"
                                required
                                className={inputClass}
                            />
                        </div>

                        {/* Nota Fiscal */}
                        <div>
                            <label className={labelClass}>Nota Fiscal</label>
                            <input
                                type="text"
                                value={notaFiscal}
                                onChange={e => setNotaFiscal(e.target.value)}
                                placeholder="Ex: NF 12345"
                                className={inputClass}
                            />
                        </div>

                        {/* Data Da Postagem */}
                        <div>
                            <label className={labelClass}>Data da Postagem <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                value={dataPostagem}
                                onChange={e => setDataPostagem(e.target.value)}
                                required
                                className={inputClass}
                            />
                        </div>

                        {/* Consumidor */}
                        <div className="sm:col-span-2">
                            <label className={labelClass}>Nome do Consumidor <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={consumidor}
                                onChange={e => setConsumidor(e.target.value)}
                                placeholder="Ex: João da Silva"
                                required
                                className={inputClass}
                            />
                        </div>

                        {/* Status Atual */}
                        <div>
                            <label className={labelClass}>Status Atual <span className="text-red-500">*</span></label>
                            <select
                                value={statusAtual}
                                onChange={e => setStatusAtual(e.target.value)}
                                className={inputClass}
                            >
                                <option value="Em Tratativa">Em Tratativa</option>
                                <option value="Respondido">Respondido</option>
                                <option value="Aguardando Consumidor">Aguardando Consumidor</option>
                                <option value="Finalizado">Finalizado</option>
                                <option value="Moderação Solicitada">Moderação Solicitada</option>
                                <option value="Desativada">Desativada</option>
                            </select>
                        </div>

                        {/* Entrada */}
                        <div>
                            <label className={labelClass}>Entrada / Canal</label>
                            <input
                                type="text"
                                value={entrada}
                                onChange={e => setEntrada(e.target.value)}
                                placeholder="Ex: Reclame Aqui, Procon, etc."
                                className={inputClass}
                            />
                        </div>

                        {/* Chamado */}
                        <div>
                            <label className={labelClass}>Nº do Chamado</label>
                            <input
                                type="text"
                                value={chamado}
                                onChange={e => setChamado(e.target.value)}
                                placeholder="Ex: 2024-987654"
                                className={inputClass}
                            />
                        </div>

                        {/* E-mail */}
                        <div>
                            <label className={labelClass}>E-mail</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="cliente@email.com"
                                className={inputClass}
                            />
                        </div>

                        {/* Data do Contato */}
                        <div>
                            <label className={labelClass}>Data do Contato</label>
                            <input
                                type="date"
                                value={dataContato}
                                onChange={e => setDataContato(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {/* Resposta Pública */}
                        <div>
                            <label className={labelClass}>Resposta Pública (Data ou Info)</label>
                            <input
                                type="text"
                                value={respostaPublica}
                                onChange={e => setRespostaPublica(e.target.value)}
                                placeholder="Ex: 2024-05-10 ou Publicada"
                                className={inputClass}
                            />
                        </div>

                        {/* Patologia / Causa RA */}
                        <div>
                            <label className={labelClass}>Patologia / Causa RA</label>
                            <input
                                type="text"
                                value={patologiaCausa}
                                onChange={e => setPatologiaCausa(e.target.value)}
                                placeholder="Ex: Desbotamento, Bolhas, Cobertura"
                                className={inputClass}
                            />
                        </div>

                        {/* Produto */}
                        <div className="sm:col-span-2">
                            <label className={labelClass}>Produto Envolvido</label>
                            <input
                                type="text"
                                value={produto}
                                onChange={e => setProduto(e.target.value)}
                                placeholder="Ex: Toque de Seda 18L / Fosco Completo"
                                className={inputClass}
                            />
                        </div>

                        {/* Procedente */}
                        <div>
                            <label className={labelClass}>Procedente</label>
                            <select
                                value={procedente}
                                onChange={e => setProcedente(e.target.value)}
                                className={inputClass}
                            >
                                <option value="">-- Selecione --</option>
                                <option value="Sim">Sim / Procedente</option>
                                <option value="Não">Não / Improcedente</option>
                                <option value="Em Análise">Em Análise</option>
                            </select>
                        </div>

                        {/* Resolvido */}
                        <div>
                            <label className={labelClass}>Resolvido</label>
                            <select
                                value={resolvido}
                                onChange={e => setResolvido(e.target.value)}
                                className={inputClass}
                            >
                                <option value="">-- Selecione --</option>
                                <option value="Sim">Sim</option>
                                <option value="Não">Não</option>
                            </select>
                        </div>

                        {/* Voltaria a fazer negócio */}
                        <div>
                            <label className={labelClass}>Voltaria a fazer negócio</label>
                            <select
                                value={voltariaFazerNegocio}
                                onChange={e => setVoltariaFazerNegocio(e.target.value)}
                                className={inputClass}
                            >
                                <option value="">-- Selecione --</option>
                                <option value="Sim">Sim</option>
                                <option value="Não">Não</option>
                            </select>
                        </div>

                        {/* Nota de Avaliação */}
                        <div>
                            <label className={labelClass}>Nota Avaliação (0 a 10)</label>
                            <input
                                type="text"
                                value={notaAvaliacao}
                                onChange={e => setNotaAvaliacao(e.target.value)}
                                placeholder="Ex: 8, 10, 5"
                                className={inputClass}
                            />
                        </div>

                        {/* Moderação */}
                        <div>
                            <label className={labelClass}>Moderação</label>
                            <input
                                type="text"
                                value={moderacao}
                                onChange={e => setModeracao(e.target.value)}
                                placeholder="Ex: Aceita, Recusada, Pendente"
                                className={inputClass}
                            />
                        </div>

                        {/* Visita Técnica (Nome do Técnico) */}
                        <div>
                            <label className={labelClass}>Visita Técnica (Técnico)</label>
                            <input
                                type="text"
                                value={visitaTecnica}
                                onChange={e => setVisitaTecnica(e.target.value)}
                                placeholder="Nome do técnico que realizou visita"
                                className={inputClass}
                            />
                        </div>

                        {/* Mão de Obra (MO) */}
                        <div>
                            <label className={labelClass}>MO (Mão de Obra)</label>
                            <input
                                type="text"
                                value={mo}
                                onChange={e => setMo(e.target.value)}
                                placeholder="Ex: Sim, Não, R$ 500,00"
                                className={inputClass}
                            />
                        </div>

                        {/* Data Réplica */}
                        <div>
                            <label className={labelClass}>Data Réplica</label>
                            <input
                                type="date"
                                value={dataReplica}
                                onChange={e => setDataReplica(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {/* Data Tréplica */}
                        <div>
                            <label className={labelClass}>Data Tréplica</label>
                            <input
                                type="date"
                                value={dataTreplica}
                                onChange={e => setDataTreplica(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !registroRa || !consumidor}
                            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/30 active:scale-95"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    {editingRecord ? 'Atualizar Caso' : 'Salvar Caso'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
