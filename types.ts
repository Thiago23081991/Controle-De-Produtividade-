
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
  matricula: string;
  login: string;
  name: string;
  supervisor?: string;
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
    observacao?: string;
    isUrgent?: boolean;
    goal?: number;
    managerMessage?: string;
    expertMessage?: string;
    targetSupervisor?: string;
  };
}
