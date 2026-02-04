
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ClipboardList, Sparkles, RefreshCw, Calendar, LogOut, Send, BellRing, Mail, Clock, Palette, BrainCircuit, Users, Megaphone, AlertCircle, X, BarChart3, TrendingUp, CheckCircle, Activity, LayoutDashboard, Zap, Trophy, PartyPopper, MessageSquare, ChevronDown, Database, Quote, History } from 'lucide-react';
import { expertService } from './services/expertService';
import { analyzeProductivity } from './services/geminiService';
import { ManualEntryData, ExpertInfo } from './types';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { UserDashboard } from './components/UserDashboard';
import { ProductivityTable } from './components/ProductivityTable';
import { AdminPanel } from './components/AdminPanel';
import { PerformanceChart } from './components/PerformanceChart';
import { RankingPodium } from './components/RankingPodium';
import { supabase, isSupabaseConfigured, supabaseUrl } from './services/supabaseClient';
import { exportToExcel } from './utils/excelExport';



const MESSAGE_DURATION_MS = 3 * 60 * 1000; // 3 minutos
const SAVE_DEBOUNCE_MS = 1000; // Tempo de espera para salvar após digitar (1 segundo)

const MOTIVATIONAL_QUOTES = [
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "A persistência é o caminho do êxito.",
  "Não pare até se orgulhar do que construiu.",
  "Grandes coisas nunca vêm de zonas de conforto.",
  "Seu único limite é onde você decide parar.",
  "Foco na meta, força na luta.",
  "Transforme obstáculos em degraus para o topo.",
  "A disciplina é a ponte entre metas e realizações.",
  "Faça hoje o seu melhor absoluto.",
  "A excelência não é um ato, mas um hábito.",
  "Qualidade significa fazer certo quando ninguém está olhando.",
  "Sua atitude determina sua altitude.",
  "O único lugar onde o sucesso vem antes do trabalho é no dicionário."
];

// Gerenciamento de Áudio Global
let globalAudioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!globalAudioCtx) {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
};

/**
 * Som da Urna Eletrônica (3 tons ascendentes) para o Expert
 */
const playUrnaBeep = () => {
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const playTone = (freq: number, start: number, duration: number, vol: number = 0.05) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.01);
      gain.gain.setValueAtTime(vol, ctx.currentTime + start + duration - 0.01);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    const t = 0.12;
    playTone(1000, 0, t);
    playTone(1250, t, t);
    playTone(1500, t * 2, t * 2.5, 0.07);
  } catch (e) { console.error(e); }
};

/**
 * Som de celebração de Meta Batida (Fanfarra Digital)
 */
const playGoalReachedBeep = () => {
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const playTone = (freq: number, start: number, duration: number, vol: number = 0.06) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle'; // Som mais encorpado para celebração
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    // Arpejo de celebração (Dó maior)
    const t = 0.15;
    playTone(523.25, 0, 0.4);   // C5
    playTone(659.25, t, 0.4);   // E5
    playTone(783.99, t * 2, 0.4); // G5
    playTone(1046.50, t * 3, 0.8); // C6
  } catch (e) { console.error(e); }
};

const playSuccessBeep = () => {
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) { console.error(e); }
};

const getTodayString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
  const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0]
  };
};

const getInitialData = (experts: ExpertInfo[]): ManualEntryData => {
  const sortedRoster = experts.map(e => e.name).sort((a, b) => a.localeCompare(b));
  return sortedRoster.reduce((acc, name) => {
    acc[name] = { tratado: 0, finalizado: 0, observacao: '', isUrgent: false, goal: 0, managerMessage: '', expertMessage: '', targetSupervisor: '' };
    return acc;
  }, {} as ManualEntryData);
};

// SKELETON COMPONENTS REMOVED (Moved to individual components)

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<ExpertInfo | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);


  const [isSyncing, setIsSyncing] = useState(false); // Sincronização em background

  // Loading States separados para melhor UX
  const [isTableLoading, setIsTableLoading] = useState(false); // Carregamento da tabela geral
  const [isStatsLoading, setIsStatsLoading] = useState(false); // Carregamento dos dados do usuário (cards)

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('TODOS');
  const [notification, setNotification] = useState<{ message: string; visible: boolean; type?: 'success' | 'info' | 'error' | 'alert' | 'celebration' } | null>(null);
  const [tempMessages, setTempMessages] = useState<Record<string, string>>({});

  const [expertMessageInput, setExpertMessageInput] = useState('');
  const [expertTargetSupervisor, setExpertTargetSupervisor] = useState('');

  // Admin Panel State
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const [experts, setExperts] = useState<ExpertInfo[]>([]);
  const [data, setData] = useState<ManualEntryData>({});

  // Carrega lista de experts ao iniciar
  useEffect(() => {
    const loadExperts = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const list = await expertService.getAll();
        setExperts(list);
        setData(getInitialData(list));
      } catch (error) {
        console.error("Erro ao carregar experts:", error);
        setNotification({ message: 'Erro ao carregar lista de experts.', visible: true, type: 'error' });
      }
    };
    loadExperts();
  }, []);

  const expertMap = useMemo(() => {
    return experts.reduce((acc, expert) => {
      acc[expert.name] = expert;
      return acc;
    }, {} as Record<string, ExpertInfo>);
  }, [experts]);
  const [weeklyStats, setWeeklyStats] = useState({ tratado: 0, finalizado: 0 });

  // Estado para armazenar as médias históricas (para exibição na UI)
  const [historicalAverages, setHistoricalAverages] = useState<Record<string, number>>({});

  // Ref para acessar o estado mais recente dentro de funções assíncronas (saveToSupabase)
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  // Ref para armazenar os timers de debounce de salvamento por expert
  const saveTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const lastMessageRef = useRef<string>('');
  const goalReachedRef = useRef<boolean>(false);
  const prevExpertMessages = useRef<Record<string, string>>({});

  const supervisors = useMemo(() => {
    const list = new Set<string>();
    experts.forEach(e => e.supervisor && list.add(e.supervisor));
    return ['TODOS', ...Array.from(list).sort()];
  }, [experts]);

  const dailyQuote = useMemo(() => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  }, []);

  const isDemoMode = false;

  // Sync expert target supervisor from loaded data
  useEffect(() => {
    if (currentUser && data[currentUser.name]) {
      const savedTarget = data[currentUser.name].targetSupervisor;
      if (savedTarget) {
        setExpertTargetSupervisor(savedTarget);
      } else if (currentUser.supervisor) {
        setExpertTargetSupervisor(currentUser.supervisor);
      }
    }
  }, [currentUser, data]);

  const loadWeeklyStats = useCallback(async (expertName: string) => {
    if (!isSupabaseConfigured) return;
    const { start, end } = getCurrentWeekRange();
    try {
      const { data: records, error } = await supabase
        .from('productivity_records')
        .select('tratado, finalizado')
        .eq('expert_name', expertName)
        .gte('date', start)
        .lte('date', end);

      if (!error && records) {
        const totals = records.reduce((acc, rec) => ({
          tratado: acc.tratado + (rec.tratado || 0),
          finalizado: acc.finalizado + (rec.finalizado || 0)
        }), { tratado: 0, finalizado: 0 });
        setWeeklyStats(totals);
      }
    } catch (e) {
      console.error("Erro ao carregar stats semanais:", e);
    }
  }, []);

  const loadSupabaseData = useCallback(async (date: string, isBackground = false, specificExpert?: string) => {
    if (!isSupabaseConfigured) return;

    if (isBackground) {
      setIsSyncing(true);
    }

    try {
      // Data limite para cálculo de média (30 dias atrás)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      // Otimização: Se pedir um expert específico, filtra na query
      let queryToday = supabase.from('productivity_records').select('*').eq('date', date);

      // Query de histórico para calcular médias
      let queryHistory = supabase.from('productivity_records')
        .select('expert_name, tratado, finalizado')
        .lt('date', date) // Exclui o dia atual da média
        .gte('date', thirtyDaysAgoStr);

      if (specificExpert) {
        queryToday = queryToday.eq('expert_name', specificExpert);
        queryHistory = queryHistory.eq('expert_name', specificExpert);
      }

      // Executa as queries em paralelo
      const [todayResult, historyResult] = await Promise.all([queryToday, queryHistory]);

      const records = todayResult.data;
      const historyRecords = historyResult.data;

      if (todayResult.error) {
        console.error("Erro ao carregar dados:", todayResult.error);
        if (!isBackground) {
          setNotification({ message: `Erro de conexão: ${todayResult.error.message || JSON.stringify(todayResult.error)}`, visible: true, type: 'error' });
        }
        return;
      }

      // 1. Calcula as médias baseadas no histórico
      const averagesSum: Record<string, number> = {};
      const averagesCount: Record<string, number> = {};
      const calculatedAverages: Record<string, number> = {};

      if (historyRecords) {
        historyRecords.forEach(rec => {
          const totalProd = (rec.tratado || 0) + (rec.finalizado || 0);
          if (totalProd > 0) { // Considera apenas dias trabalhados/ativos
            averagesSum[rec.expert_name] = (averagesSum[rec.expert_name] || 0) + totalProd;
            averagesCount[rec.expert_name] = (averagesCount[rec.expert_name] || 0) + 1;
          }
        });

        Object.keys(averagesSum).forEach(name => {
          const count = averagesCount[name];
          calculatedAverages[name] = count > 0 ? Math.round(averagesSum[name] / count) : 0;
        });

        // Atualiza estado de médias para uso na UI
        if (!specificExpert) { // Só atualiza globalmente se não for busca específica
          setHistoricalAverages(calculatedAverages);
        }
      }

      // 2. Processa os dados de hoje e aplica a meta baseada na média se necessário
      if (records) {
        setData(prev => {
          const nextData = { ...prev };

          records.forEach(rec => {
            // Determina a meta: Se já existe no banco (>0), usa ela. Se for 0, usa a média.
            const avgGoal = calculatedAverages[rec.expert_name] || 0;
            const effectiveGoal = rec.goal > 0 ? rec.goal : avgGoal;

            nextData[rec.expert_name] = {
              tratado: rec.tratado,
              finalizado: rec.finalizado,
              goal: effectiveGoal, // Usa a média se não houver meta manual
              observacao: rec.observacao || '',
              isUrgent: rec.is_urgent,
              managerMessage: rec.manager_message || '',
              expertMessage: rec.expert_message || '',
              targetSupervisor: rec.target_supervisor || ''
            };
          });

          // Caso experts não tenham registro HOJE, mas tenham média, pré-preencher a meta no estado local
          if (!isBackground) { // Apenas na carga inicial para não sobrescrever digitação
            Object.keys(calculatedAverages).forEach(expert => {
              // Se o expert não tem registro hoje (ou tem dados zerados), mas tem média
              if ((!nextData[expert] || (nextData[expert].goal === 0)) && calculatedAverages[expert] > 0) {
                nextData[expert] = {
                  ...(nextData[expert] || { tratado: 0, finalizado: 0, observacao: '', isUrgent: false, managerMessage: '', expertMessage: '', targetSupervisor: '' }),
                  goal: calculatedAverages[expert]
                };
              }
            });
          }

          return nextData;
        });
      }
    } catch (e: any) {
      console.error("Exceção loadSupabaseData:", e);
    } finally {
      if (isBackground) setIsSyncing(false);
    }
  }, [experts]);

  // Carrega dados mensais
  const loadMonthlyData = useCallback(async (month: number, year: number) => {
    if (!isSupabaseConfigured) return;
    setIsTableLoading(true);
    try {
      const monthlyData = await expertService.getMonthlyData(month, year);

      // Converte o array de dados mensais para o formato ManualEntryData
      setData(prev => {
        const nextData = getInitialData(experts);
        // Preenche com os dados carregados
        monthlyData.forEach((rec: any) => {
          if (nextData[rec.expert_name]) {
            nextData[rec.expert_name] = {
              ...nextData[rec.expert_name],
              tratado: rec.tratado,
              finalizado: rec.finalizado,
              goal: rec.goal,
              observacao: rec.observacao || ''
            };
          }
        });
        return nextData;
      });

    } catch (error) {
      console.error("Erro ao carregar dados mensais:", error);
      setNotification({ message: 'Erro ao carregar dados mensais.', visible: true, type: 'error' });
    } finally {
      setIsTableLoading(false);
    }
  }, [experts]);

  // Efeito principal para carga de dados (Staged Loading)
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Ao mudar a data, limpa o estado para evitar dados misturados
    // Ao mudar a data, limpa o estado para evitar dados misturados (mas mantendo a lista de experts base)
    setData(getInitialData(experts));

    const fetchData = async () => {
      if (viewMode === 'monthly') {
        await loadMonthlyData(selectedMonth, selectedYear);
        return;
      }

      // Estratégia de Carregamento Prioritário

      // 1. Prioridade Alta: Dados do Usuário Logado (se houver)
      if (currentUser && !isAdmin) {
        setIsStatsLoading(true);
        // Busca dados do dia e da semana em paralelo APENAS para o usuário
        await Promise.all([
          loadSupabaseData(selectedDate, false, currentUser.name),
          loadWeeklyStats(currentUser.name)
        ]);
        setIsStatsLoading(false);

        // 2. Prioridade Baixa: Restante da tabela (background-ish)
        setIsTableLoading(true);
        await loadSupabaseData(selectedDate, false); // Busca tudo
        setIsTableLoading(false);
      } else {
        // Admin ou sem usuário: Carrega tudo de uma vez
        setIsTableLoading(true);
        setIsStatsLoading(true);
        await loadSupabaseData(selectedDate, false);
        setIsTableLoading(false);
        setIsStatsLoading(false);
      }
    };

    fetchData();

    // Configuração do Realtime (Apenas para modo diário por enquanto)
    if (viewMode === 'monthly') return;

    const channel = supabase.channel(`prod-changes-${selectedDate}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productivity_records', filter: `date=eq.${selectedDate}` }, (payload) => {
        const rec = payload.new as any;
        if (rec && rec.expert_name) {
          setData(prev => ({
            ...prev,
            [rec.expert_name]: {
              tratado: rec.tratado ?? 0,
              finalizado: rec.finalizado ?? 0,
              goal: rec.goal ?? 0,
              observacao: rec.observacao || '',
              isUrgent: rec.is_urgent,
              managerMessage: rec.manager_message || '',
              expertMessage: rec.expert_message || '',
              targetSupervisor: rec.target_supervisor || ''
            }
          }));
          if (currentUser && rec.expert_name === currentUser.name) {
            loadWeeklyStats(currentUser.name);
          }
        }
      }).subscribe();

    const pollInterval = setInterval(() => {
      if (!document.hidden) {
        loadSupabaseData(selectedDate, true);
      }
    }, 10000);

    const onFocus = () => {
      loadSupabaseData(selectedDate, true);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
      window.removeEventListener('focus', onFocus);
    };
  }, [selectedDate, loadSupabaseData, currentUser, loadWeeklyStats, isAdmin, viewMode, selectedMonth, selectedYear, loadMonthlyData]);

  useEffect(() => {
    Object.keys(data).forEach(name => {
      const msg = data[name]?.expertMessage || '';
      const target = data[name]?.targetSupervisor;
      const prevMsg = prevExpertMessages.current[name];

      if (isAdmin && !isSyncing && prevMsg !== undefined && msg !== prevMsg && msg.trim() !== '') {
        const isForMe = selectedSupervisor === 'TODOS' || (target && target.trim() === selectedSupervisor);
        if (isForMe) {
          playUrnaBeep();
          setNotification({
            message: `💬 ${name.split(' ')[0]} para ${target ? target.split(' ')[0] : 'Supervisão'}`,
            visible: true,
            type: 'info'
          });
        }
      }

      prevExpertMessages.current[name] = msg;
    });
  }, [data, isAdmin, isSyncing, selectedSupervisor]);

  const saveToSupabase = async (expert: string, updateData: Partial<ManualEntryData[string]>) => {
    if (!isSupabaseConfigured) return;

    // USAR dataRef.current para garantir que temos os dados mais recentes no momento do envio
    const entry = dataRef.current[expert];
    const fullData = { ...entry, ...updateData };

    const payload: any = {
      expert_name: expert,
      tratado: fullData.tratado ?? 0,
      finalizado: fullData.finalizado ?? 0,
      goal: fullData.goal ?? 0,
      observacao: fullData.observacao ?? '',
      updated_at: new Date().toISOString()
    };

    if (viewMode === 'daily') {
      payload.date = selectedDate;
      payload.is_urgent = fullData.isUrgent ?? false;
      payload.manager_message = fullData.managerMessage ?? '';
      payload.expert_message = fullData.expertMessage ?? '';
      payload.target_supervisor = fullData.targetSupervisor ?? '';
    } else {
      payload.month = selectedMonth;
      payload.year = selectedYear;
    }

    try {
      const { error } = await supabase
        .from(viewMode === 'daily' ? 'productivity_records' : 'monthly_productivity')
        .upsert(payload, { onConflict: viewMode === 'daily' ? 'date,expert_name' : 'expert_name,month,year' });

      if (error) {
        if (error.code === '42703' || error.message.includes('column') || error.message.includes('does not exist')) {
          console.warn("Modo de compatibilidade (colunas faltando)...");

          const legacyPayload = {
            date: selectedDate,
            expert_name: expert,
            tratado: fullData.tratado,
            finalizado: fullData.finalizado,
            goal: fullData.goal,
            observacao: fullData.observacao,
            is_urgent: fullData.isUrgent,
            updated_at: new Date().toISOString()
          };

          const { error: legacyError } = await supabase.from('productivity_records').upsert(legacyPayload, { onConflict: 'date,expert_name' });
          if (legacyError) throw legacyError;

          if (!sessionStorage.getItem('db_warned')) {
            setNotification({
              message: '⚠️ BANCO DESATUALIZADO: Faltam colunas. Copie o arquivo "supabase_setup.sql" e rode no SQL Editor do Supabase!',
              visible: true,
              type: 'alert'
            });
            sessionStorage.setItem('db_warned', 'true');
          }
          return;
        }
        throw error;
      }
    } catch (e: any) {
      console.error("Exceção ao salvar:", e);
      let msg = e.message || JSON.stringify(e);
      if (msg.includes('JWT')) msg = "Sessão expirada, recarregue a página.";
      setNotification({ message: `Erro ao salvar: ${msg}`, visible: true, type: 'error' });
    }

    if (currentUser && expert === currentUser.name) {
      loadWeeklyStats(expert);
    }
  };

  const handleLoginSuccess = (user: ExpertInfo | 'admin') => {
    initAudio();
    if (user === 'admin') {
      setIsAdmin(true);
      setIsLoggedIn(true);
    } else {
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setShowAdminPanel(false);

    lastMessageRef.current = '';
    goalReachedRef.current = false;
    setAiAnalysis(null);
    setExpertMessageInput('');
    setExpertTargetSupervisor('');
    prevExpertMessages.current = {};
    setData(getInitialData(experts));
  };

  const handleInputChange = (expert: string, field: 'tratado' | 'finalizado' | 'observacao' | 'goal', value: string) => {
    // Conversão segura
    const finalValue = field === 'observacao' ? value : Math.max(0, parseInt(value) || 0);

    // Atualização Otimista da Interface (Imediata)
    setData(prev => ({ ...prev, [expert]: { ...prev[expert], [field]: finalValue } }));

    // Debounce do Salvamento no Banco (Aguarda o usuário parar de digitar)
    if (saveTimeoutRef.current[expert]) {
      clearTimeout(saveTimeoutRef.current[expert]);
    }

    saveTimeoutRef.current[expert] = setTimeout(() => {
      saveToSupabase(expert, { [field]: finalValue });
    }, SAVE_DEBOUNCE_MS);
  };

  const handleSendMessage = (expert: string) => {
    const msg = tempMessages[expert] || '';
    if (!msg.trim()) return;

    if (!isSupabaseConfigured) {
      setNotification({ message: 'Falha: Banco de dados desconectado.', visible: true, type: 'error' });
      return;
    }

    saveToSupabase(expert, { managerMessage: msg });
    playSuccessBeep();
    setNotification({ message: `Aviso enviado para ${expert.split(' ')[0]}`, visible: true, type: 'success' });
    setTempMessages(prev => ({ ...prev, [expert]: '' }));
  };

  const handleSendExpertMessage = () => {
    if (!currentUser || !expertMessageInput.trim()) return;

    if (!isSupabaseConfigured) {
      setNotification({ message: 'Falha: Banco de dados desconectado.', visible: true, type: 'error' });
      return;
    }

    const target = expertTargetSupervisor || (currentUser.supervisor ? currentUser.supervisor : 'TODOS');
    const newData = {
      ...data[currentUser.name],
      expertMessage: expertMessageInput,
      targetSupervisor: target
    };
    setData(prev => ({ ...prev, [currentUser.name]: newData }));
    // Mensagens de chat não precisam de debounce, pois são eventos pontuais de clique
    saveToSupabase(currentUser.name, { expertMessage: expertMessageInput, targetSupervisor: target });
    playSuccessBeep();
    setNotification({ message: `Enviada para ${target === 'TODOS' ? 'Supervisão Geral' : target.split(' ')[0]}!`, visible: true, type: 'success' });
    setExpertMessageInput('');
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeProductivity(data);
      setAiAnalysis(analysis);
      setNotification({ message: 'Análise gerada!', visible: true, type: 'success' });
    } catch (err) {
      setNotification({ message: 'Erro na análise IA.', visible: true, type: 'error' });
    } finally { setIsAnalyzing(false); }
  };

  const visibleExperts = useMemo(() => {
    if (!isAdmin) return currentUser ? [currentUser.name] : [];
    return Object.keys(data).filter(name => {
      if (selectedSupervisor === 'TODOS') return true;
      const officialSupervisor = expertMap[name]?.supervisor;
      const targetSupervisor = data[name]?.targetSupervisor;
      const hasMessage = !!data[name]?.expertMessage;
      const isTeamMember = officialSupervisor === selectedSupervisor;
      const isTargetingThisSupervisor = hasMessage && targetSupervisor && targetSupervisor.trim() === selectedSupervisor;
      return isTeamMember || isTargetingThisSupervisor;
    }).sort();
  }, [isAdmin, currentUser, data, selectedSupervisor, expertMap]);

  const handleExport = () => {
    exportToExcel({
      data,
      expertMap,
      viewMode,
      period: viewMode === 'daily'
        ? selectedDate.split('-').reverse().join('/')
        : `${new Date(0, selectedMonth - 1).toLocaleString('pt-BR', { month: 'long' })}_${selectedYear}`
    });
  };

  const expertReceivedMessage = (!isAdmin && currentUser) ? data[currentUser.name]?.managerMessage : null;

  useEffect(() => {
    if (!isAdmin && currentUser) {
      const expertData = data[currentUser.name];
      if (expertReceivedMessage) {
        const msg = expertReceivedMessage.trim();
        if (msg && msg !== lastMessageRef.current) {
          playUrnaBeep();
          setNotification({ message: '🔔 NOVA MENSAGEM DA GESTÃO', visible: true, type: 'alert' });
          lastMessageRef.current = msg;
        }
        const timer = setTimeout(() => {
          saveToSupabase(currentUser.name, { managerMessage: '' });
          lastMessageRef.current = '';
          setNotification(null);
        }, MESSAGE_DURATION_MS);
        return () => clearTimeout(timer);
      }

      // Cálculo da meta: Tratado + Finalizado
      const totalProd = (expertData.tratado || 0) + (expertData.finalizado || 0);
      if (expertData.goal > 0 && totalProd >= expertData.goal) {
        if (!goalReachedRef.current) {
          playGoalReachedBeep();
          setNotification({
            message: '🏆 PARABÉNS! META DIÁRIA BATIDA!',
            visible: true,
            type: 'celebration'
          });
          goalReachedRef.current = true;
        }
      } else {
        goalReachedRef.current = false;
      }
    }
  }, [expertReceivedMessage, currentUser, isAdmin, data]);

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={handleLoginSuccess}
        experts={experts}
        isDemoMode={isDemoMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans transition-all duration-700" onClick={() => initAudio()}>
      <div className="max-w-7xl mx-auto space-y-6">

        <Header
          isAdmin={isAdmin}
          isDemoMode={isDemoMode}
          isSupabaseConfigured={isSupabaseConfigured}
          dailyQuote={dailyQuote}
          selectedSupervisor={selectedSupervisor}
          setSelectedSupervisor={setSelectedSupervisor}
          supervisors={supervisors}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          isSyncing={isSyncing}
          onRefresh={() => viewMode === 'daily' ? loadSupabaseData(selectedDate, false) : loadMonthlyData(selectedMonth, selectedYear)}
          onLogout={handleLogout}
          showAdminPanel={showAdminPanel}
          setShowAdminPanel={setShowAdminPanel}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          onExport={handleExport}
        />

        {showAdminPanel && isAdmin ? (
          <AdminPanel supervisors={supervisors} />
        ) : (
          <>
            {expertReceivedMessage && (
              <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10 animate-in fade-in slide-in-from-top-10 duration-700 border-4 border-orange-600">
                <div className="absolute top-0 left-0 h-2 bg-orange-600 z-10" style={{ width: '100%', animation: `shrinkWidth ${MESSAGE_DURATION_MS}ms linear forwards` }}></div>
                <div className="bg-orange-600 p-6 rounded-[2rem] shadow-xl shadow-orange-600/30 rotate-3">
                  <Megaphone size={56} className="text-white animate-pulse" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-white/10 px-4 py-1.5 rounded-full">Gestão Direta</span>
                  </div>
                  <p className="text-4xl font-black italic tracking-tighter leading-none text-orange-50 underline decoration-orange-600/50 underline-offset-8">"{expertReceivedMessage}"</p>
                  <div className="mt-8 flex items-center justify-center md:justify-start gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                    <Clock size={12} /> Esta mensagem expira em 3 minutos
                  </div>
                </div>
              </div>
            )}

            {!isAdmin && currentUser && (
              <UserDashboard
                currentUser={currentUser}
                data={data}
                weeklyStats={weeklyStats}
                isStatsLoading={isStatsLoading}
                supervisors={supervisors}
                expertTargetSupervisor={expertTargetSupervisor}
                setExpertTargetSupervisor={setExpertTargetSupervisor}
                expertMessageInput={expertMessageInput}
                setExpertMessageInput={setExpertMessageInput}
                handleSendExpertMessage={handleSendExpertMessage}
              />
            )}

            {isAdmin && data && <RankingPodium data={data} />}

            <ProductivityTable
              data={data}
              visibleExperts={visibleExperts}
              isAdmin={isAdmin}
              isTableLoading={isTableLoading}
              isSyncing={isSyncing}
              handleInputChange={handleInputChange}
              expertMap={expertMap}
              historicalAverages={historicalAverages}
              tempMessages={tempMessages}
              setTempMessages={setTempMessages}
              handleSendMessage={handleSendMessage}
              selectedSupervisor={selectedSupervisor}
              viewMode={viewMode}
              isAdmin={isAdmin}
              onSyncDaily={() => {
                Object.keys(data).forEach(async (expertName) => {
                  if (!expertMap[expertName]) return;
                  // Logic to trigger sync for this expert
                  try {
                    const totals = await expertService.aggregateDailyRecords(expertName, selectedMonth, selectedYear);
                    handleInputChange(expertName, 'tratado', totals.tratado.toString());
                    handleInputChange(expertName, 'finalizado', totals.finalizado.toString());
                    setNotification({ message: `Sincronizado: ${expertName}`, visible: true, type: 'success' });
                  } catch (e) {
                    console.error('Erro ao sincronizar expert:', expertName, e);
                  }
                });
              }}
            />

            {isAdmin && <PerformanceChart data={Object.fromEntries(visibleExperts.map(name => [name, data[name]]))} />}

            {isAdmin && (
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-slate-900 text-white p-8 rounded-[3rem] font-black flex items-center justify-center gap-4 hover:bg-orange-600 transition-all shadow-2xl disabled:bg-slate-200 group active:scale-[0.99]"
              >
                {isAnalyzing ? <RefreshCw className="animate-spin" /> : <BrainCircuit className="group-hover:rotate-12 transition-transform" />}
                <span className="uppercase tracking-[0.3em] text-xs">Gerar Inteligência Operacional {selectedSupervisor !== 'TODOS' ? `| TIME ${selectedSupervisor}` : ''}</span>
              </button>
            )}

            {isAdmin && aiAnalysis && (
              <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border-l-[16px] border-orange-600 animate-in zoom-in duration-500">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-2xl"><Sparkles className="text-orange-600" /></div>
                    <div>
                      <h3 className="text-xl font-black italic tracking-tight">Relatório Executivo IA</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Análise Baseada em Dados Suvinil</p>
                    </div>
                  </div>
                  <button onClick={() => setAiAnalysis(null)} className="text-slate-300 hover:text-slate-900 bg-slate-50 p-3 rounded-full transition-colors"><X size={24} /></button>
                </div>
                <div className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed text-lg whitespace-pre-line">
                  {aiAnalysis}
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {notification?.visible && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-6 animate-in fade-in zoom-in slide-in-from-top-10 duration-500">
          <div className={`px-8 py-6 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] text-white font-black flex items-center gap-6 border-2 border-white/20 backdrop-blur-md ${notification.type === 'error' ? 'bg-red-600' :
            notification.type === 'alert' ? 'bg-orange-600' :
              notification.type === 'celebration' ? 'bg-gradient-to-r from-yellow-400 to-orange-600 scale-110 shadow-orange-500/50' :
                notification.type === 'info' ? 'bg-slate-900' : 'bg-slate-900'
            }`}>
            <div className="bg-white/10 p-3 rounded-2xl animate-pulse">
              {notification.type === 'celebration' ? <Trophy size={24} /> : <BellRing size={24} className="text-white" />}
            </div>
            <div className="flex-1">
              <p className="text-[10px] opacity-60 uppercase tracking-widest mb-1 font-black">
                {notification.type === 'celebration' ? 'Conquista Suvinil' : 'Sistema Cloud'}
              </p>
              <span className="text-sm block tracking-tight leading-tight uppercase italic font-black">{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shrinkWidth { from { width: 100%; } to { width: 0%; } }
        .animate-in { animation-duration: 0.7s; animation-fill-mode: both; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in { from { transform: scale(0.9); } to { transform: scale(1); } }
        @keyframes slide-in-from-top-10 { from { transform: translateY(-2.5rem); } to { transform: translateY(0); } }
        .fade-in { animation-name: fade-in; }
        .zoom-in { animation-name: zoom-in; }
        .slide-in-from-top-10 { animation-name: slide-in-from-top-10; }
      `}</style>
    </div>
  );
}

export default App;
