
export enum TimeSlot {
  EARLY = 'Até 10:00',
  MORNING = '10:01 - 12:00',
  LUNCH = '12:01 - 14:00',
  AFTERNOON = '14:01 - 16:00',
  LATE = 'Após 16:00'
}

export enum RecordStatus {
  FINALIZADO = 'FINALIZADO',
  PENDENTE = 'PENDENTE',
  UNKNOWN = 'DESCONHECIDO'
}

export interface ExpertInfo {
  id?: string;
  matricula: string;
  login: string;
  name: string;
  supervisor?: string;
  active?: boolean;
  is_caso_perfeito_expert?: boolean;
}

export interface CasoPerfeitoRecord {
  id?: string;
  date: string;
  expert_name: string;
  protocolo: string;
  consumidor_lojista: string;
  processo_realizado: string;
  celula: string;
}

export interface ParsedRecord {
  id: string;
  originalText: string;
  expertName: string;
  timeStr: string | null;
  status: RecordStatus;
  timeSlot: TimeSlot | null;
  isValid: boolean;
  reason?: string;
}

export interface MatrixData {
  [expertName: string]: {
    [key in TimeSlot]: number;
  };
}

export interface ManualEntryData {
  [expertName: string]: {
    tratado: number;
    finalizado: number;
    whatsapp?: number;
    revenda?: number;
    encontre_pintor?: number;
    observacao?: string;
    isUrgent?: boolean;
    goal?: number;
    managerMessage?: string;
    expertMessage?: string;
    targetSupervisor?: string;
  };
}

export interface MonthlyData {
  id?: string;
  expert_name: string;
  month: number;
  year: number;
  tratado: number;
  finalizado: number;
  whatsapp?: number;
  revenda?: number;
  encontre_pintor?: number;
  goal: number;
  observacao?: string;
}
