import { TimeSlot, RecordStatus, ParsedRecord, MatrixData, ExpertInfo } from '../types';

// Keywords that indicate a finished task
const DONE_KEYWORDS = ['finalizado', 'resolvido', 'vendido', 'concluido', 'concluído', 'encerrado', 'ok'];
// Keywords that indicate a pending task
const PENDING_KEYWORDS = ['tratativa', 'pendente', 'andamento', 'analise', 'análise', 'aguardando'];

export const EXPERT_LIST: ExpertInfo[] = [
  { matricula: "340021", login: "213638", name: "DOUGLAS FALCAO CAVALCANTE", supervisor: "GABRIEL MORALES RODRIGUES" },
  { matricula: "339943", login: "213621", name: "FABIO DA SILVA FERREIRA", supervisor: "GABRIEL MORALES RODRIGUES" },
  { matricula: "339944", login: "213637", name: "RODRIGO FERREIRA DE VASCONCELOS", supervisor: "GABRIEL MORALES RODRIGUES" },
  { matricula: "372438", login: "213681", name: "THAIS APARECIDA SOUZA DOS SANTOS", supervisor: "GABRIEL MORALES RODRIGUES" },
  { matricula: "372581", login: "213682", name: "ANNA BEATRIZ FERREIRA MENDES", supervisor: "GABRIEL MORALES RODRIGUES" },
  { matricula: "372436", login: "213683", name: "ESTER ALVES FERREIRA", supervisor: "GABRIEL MORALES RODRIGUES" },
  { matricula: "373241", login: "213684", name: "LUCAS ALBERTO ESPINDULA SANTOS", supervisor: "GABRIEL MORALES RODRIGUES" },
  { matricula: "308652", login: "213716", name: "LUIZ GABRIEL DE FREITAS TEMOTEO", supervisor: "GABRIEL MORALES RODRIGUES" },
  { matricula: "300031", login: "213745", name: "VALERIA SILVA LEITE", supervisor: "GABRIEL MORALES RODRIGUES" },
  { matricula: "368131", login: "213678", name: "CAIO FELIPE DA SILVA", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "358255", login: "213662", name: "ROBERTA NICOLETTI PORTELA", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "321773", login: "213612", name: "JOAO PEDRO MARTINS CARVALHO", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "360691", login: "213664", name: "TATIANE APARECIDA DE ARAUJO JACINTO", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "315013", login: "213622", name: "EDUARDA TACIANA DA SILVA AVELINO FERREIRA", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "243176", login: "213776", name: "HELEN NARA SALES DE SOUZA", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "363744", login: "213669", name: "EDUARDO NASCIMENTO E SILVA", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "335425", login: "213609", name: "SABRINA DA SILVA", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "304244", login: "213710", name: "EDENILZA MIRANDA SANTANA", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "306700", login: "213693", name: "DIENE KELY ARCELINO DE LIMA", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "298615", login: "213748", name: "JOÃO MARCOS DA SILVA CASTRO", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "284397", login: "213633", name: "KARINA JESUS VIEIRA", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "349577", login: "213654", name: "KETLYN DAIANE DA SILVA FREIRE", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "330636", login: "213646", name: "CRISLANE LIMA DE SOUZA", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "333601", login: "213651", name: "LUIZ FERNANDO DE SOUZA DA SILVA", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "284396", login: "213632", name: "CARINE PEREIRA DOS SANTOS REIS", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "317094", login: "213618", name: "WENNY BIANCA DOS SANTOS FARIA", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "315015", login: "213619", name: "INGRYD OLIVEIRA MENDES DE BRITO", supervisor: "THIAGO DA SILVA NASCIMENTO" },
  { matricula: "377504", login: "213689", name: "EMANUELLE COBO SALLES", supervisor: "GABRIEL MORALES RODRIGUES" },
  { matricula: "351216", login: "213656", name: "LUCINEIA BENEDITO DE SOUZA RIBEIRO", supervisor: "GABRIEL MORALES RODRIGUES" }
];

export const EXPERT_ROSTER = EXPERT_LIST.map(e => e.name);

// Map for quick lookup of expert info by name
export const EXPERT_MAP = EXPERT_LIST.reduce((acc, expert) => {
  acc[expert.name] = expert;
  return acc;
}, {} as Record<string, ExpertInfo>);

// Helper to normalize string for comparison (remove accents, lowercase)
const normalizeStr = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const determineTimeSlot = (timeStr: string): TimeSlot | null => {
  if (!timeStr) return null;
  
  const [hours, minutes] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;

  if (totalMinutes <= 600) return TimeSlot.EARLY;
  if (totalMinutes <= 720) return TimeSlot.MORNING;
  if (totalMinutes <= 840) return TimeSlot.LUNCH;
  if (totalMinutes <= 960) return TimeSlot.AFTERNOON;
  
  return TimeSlot.LATE;
};

export const parseInputText = (text: string): ParsedRecord[] => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  return lines.map((line, index) => {
    const cleanLine = line.trim();
    const id = `rec-${index}`;

    const timeMatch = cleanLine.match(/\b([0-1]?[0-9]|2[0-3]):([0-5][0-9])\b/);
    const timeStr = timeMatch ? timeMatch[0] : null;

    const lowerLine = cleanLine.toLowerCase();
    let status = RecordStatus.UNKNOWN;
    
    if (DONE_KEYWORDS.some(k => lowerLine.includes(k))) {
      status = RecordStatus.FINALIZADO;
    } else if (PENDING_KEYWORDS.some(k => lowerLine.includes(k))) {
      status = RecordStatus.PENDENTE;
    }

    let expertName = 'Desconhecido';
    const normalizedLine = normalizeStr(cleanLine);
    
    const strictMatch = EXPERT_ROSTER.find(expert => normalizedLine.includes(normalizeStr(expert)));
    
    if (strictMatch) {
      expertName = strictMatch;
    } else {
      let tempName = cleanLine;
      if (timeStr) tempName = tempName.replace(timeStr, '');
      
      [...DONE_KEYWORDS, ...PENDING_KEYWORDS].forEach(k => {
        const reg = new RegExp(k, 'gi');
        tempName = tempName.replace(reg, '');
      });

      tempName = tempName.replace(/[-–—[\]()]/g, ' ').trim();
      tempName = tempName.replace(/\s+/g, ' ');

      const candidateName = tempName.length > 0 ? capitalizeWords(tempName) : '';

      if (candidateName) {
        const normCandidate = normalizeStr(candidateName);
        const potentialMatches = EXPERT_ROSTER.filter(r => normalizeStr(r).includes(normCandidate));

        if (potentialMatches.length === 1) {
          expertName = potentialMatches[0];
        } else {
          expertName = candidateName;
        }
      }
    }

    const timeSlot = timeStr ? determineTimeSlot(timeStr) : null;

    let isValid = true;
    let reason = '';

    if (!timeStr) {
      isValid = false;
      reason = 'Horário não identificado';
    } else if (status !== RecordStatus.FINALIZADO) {
      isValid = false;
      reason = status === RecordStatus.PENDENTE ? 'Em tratativa/Pendente' : 'Status não identificado (assumido não finalizado)';
    }

    return {
      id,
      originalText: cleanLine,
      expertName,
      timeStr,
      status,
      timeSlot,
      isValid,
      reason
    };
  });
};

const capitalizeWords = (str: string) => {
  return str.replace(/\b\w/g, l => l.toUpperCase());
};

export const calculateMatrix = (records: ParsedRecord[]): MatrixData => {
  const matrix: MatrixData = {};

  EXPERT_ROSTER.forEach(name => {
    matrix[name] = {
      [TimeSlot.EARLY]: 0,
      [TimeSlot.MORNING]: 0,
      [TimeSlot.LUNCH]: 0,
      [TimeSlot.AFTERNOON]: 0,
      [TimeSlot.LATE]: 0,
    };
  });

  records.forEach(record => {
    if (record.isValid && record.status === RecordStatus.FINALIZADO && record.timeSlot) {
      if (!matrix[record.expertName]) {
        matrix[record.expertName] = {
          [TimeSlot.EARLY]: 0,
          [TimeSlot.MORNING]: 0,
          [TimeSlot.LUNCH]: 0,
          [TimeSlot.AFTERNOON]: 0,
          [TimeSlot.LATE]: 0,
        };
      }
      matrix[record.expertName][record.timeSlot]++;
    }
  });

  return matrix;
};

export const generateMarkdownTable = (matrix: MatrixData): string => {
  // Fixed typo: Property 'AFTERPOON' does not exist on type 'typeof TimeSlot'. Fixed to 'AFTERNOON'.
  const headers = ['Matrícula', 'Expert', TimeSlot.EARLY, TimeSlot.MORNING, TimeSlot.LUNCH, TimeSlot.AFTERNOON, TimeSlot.LATE, 'TOTAL'];
  
  let md = `| ${headers.join(' | ')} |\n`;
  md += `| ${headers.map(() => '---').join(' | ')} |\n`;

  const experts = Object.keys(matrix).sort();

  experts.forEach((name) => {
    const slots = matrix[name];
    const info = EXPERT_MAP[name];
    const total = Object.values(slots).reduce((a, b) => a + b, 0);
    const row = [
      info?.matricula || '-',
      name,
      slots[TimeSlot.EARLY],
      slots[TimeSlot.MORNING],
      slots[TimeSlot.LUNCH],
      slots[TimeSlot.AFTERNOON],
      slots[TimeSlot.LATE],
      total
    ];
    md += `| ${row.join(' | ')} |\n`;
  });

  return md;
};