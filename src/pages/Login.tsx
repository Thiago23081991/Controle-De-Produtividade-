import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import { ExpertInfo } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface LoginScreenProps {
    // onLogin prop removed as we use context now
    // experts prop removed as we use context now
    isDemoMode?: boolean;
}

const ADMIN_MATRICULAS = ['301052', '322110', '333596'];

const ALLOWED_MATRICULAS = [
    // Experts Transferidos de Admin
    '221362',
    '246794',
    // Experts Ressarcimento
    '308652',
    '300031',
    '243176',
    '284336',
    '306700',
    '298615',
    '284397',
    '304244',
    '317094',
    '284396',
    '284419',
    '295565',
    '284389',
    '344343',
    '382374',
    '351216',
    '377504',
    // Experts BKO
    '340021',
    '321773',
    '339944',
    '374454',
    '255921',
    '372143',
    '372438',
    '372436',
    '358255', // ROBERTA NICOLETTI PORTELA
    '368131', // CAIO FELIPE DA SILVA
    '382432', // BKO
    // Experts N1
    '363744', // EDUARDO NASCIMENTO E SILVA
    '360691', // TATIANE APARECIDA DE ARAUJO JACINTO
    '349577', // KETLYN DAIANE DA SILVA FREIRE
    '330636', // CRISLANE LIMA DE SOUZA
    '333601', // LUIZ FERNANDO DE SOUZA DA SILVA
    // Experts Obras Paradas
    '386526', // CAUE ANDRADE SILVA
    '391121', // JUSSARA APARECIDA DOS SANTOS MODESTO
    '386541', // PAMELA CARDOSO DO CARMO
    '396995', // JULIANA SOARES FREITAS
    '382372', // KETHELEEN ELERO DA SILVA
    '333598', // FERNANDA GOMES DE PAULA BARBOSA
    '391147', // MELISSA VICTORIA GENUINO
    '364184', // MARIA APARECIDA GALDINO DA SILVA
    '234392', // NATALY GOMES DA SILVA
    '368030', // NATHAN SILVA TORRES
    '392571', // YASMIM FERREIRA DOS SANTOS
    '368029', // BIANCA DE OLIVEIRA SILVA CAMPOS
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ isDemoMode = false }) => {
    const { login, experts } = useAuth();
    const [loginInput, setLoginInput] = useState('');
    const [loginError, setLoginError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const input = loginInput.trim();

        // Admin Check
        if (ADMIN_MATRICULAS.includes(input)) {
            login('admin');
            return;
        }

        // Expert Check
        const expert = experts.find(e => e.matricula === input || e.login === input);
        if (expert) {
            if (ALLOWED_MATRICULAS.includes(expert.matricula)) {
                login(expert);
            } else {
                setLoginError('Acesso não autorizado para esta matrícula.');
            }
        } else {
            setLoginError('Login não encontrado.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm text-center border-b-[12px] border-orange-600 relative overflow-hidden animate-in fade-in zoom-in duration-500">
                {isDemoMode && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-widest z-10">
                        Modo Demo
                    </div>
                )}
                <Palette className="w-16 h-16 text-orange-600 mx-auto mb-6 animate-bounce" />
                <h1 className="text-3xl font-black mb-2 italic">Suvinil Service</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Produtividade Cloud</p>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="text" value={loginInput} onChange={(e) => setLoginInput(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none text-center font-black text-xl placeholder:text-slate-200"
                        placeholder="000000"
                    />
                    {loginError && <p className="text-red-600 text-[10px] font-black uppercase tracking-widest">{loginError}</p>}
                    <button className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-orange-700 transition-all active:scale-95">ACESSAR PAINEL</button>
                </form>
            </div>
        </div>
    );
};
