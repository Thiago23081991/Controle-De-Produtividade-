import { TimeSlot, RecordStatus, ParsedRecord, MatrixData } from '../types';

// Keywords that indicate a finished task
const DONE_KEYWORDS = ['finalizado', 'resolvido', 'vendido', 'concluido', 'concluído', 'encerrado', 'ok'];
// Keywords that indicate a pending task
const PENDING_KEYWORDS = ['tratativa', 'pendente', 'andamento', 'analise', 'análise', 'aguardando'];

export const EXPERT_ROSTER = [
  "CAIO FELIPE DA SILVA",
  "ROBERTA NICOLETTI PORTELA",
  "JOAO PEDRO MARTINS CARVALHO",
  "TATIANE APARECIDA DE ARAUJO JACINTO",
  "EDUARDA TACIANA DA SILVA AVELINO FERREIRA",
  "HELEN NARA SALES DE SOUZA",
  "EDUARDO NASCIMENTO E SILVA",
  "SABRINA DA SILVA",
  "EDENILZA MIRANDA SANTANA",
  "DANIEL DOS SANTOS",
  "DIENE KELY ARCELINO DE LIMA",
  "JOÃO MARCOS DA SILVA CASTRO",
  "KARINA JESUS VIEIRA",
  "KETLYN DAIANE DA SILVA FREIRE",
  "DANIELE NASCIMENTO DOS COSTA",
  "CRISLANE LIMA DE SOUZA",
  "LUIZ FERNANDO DE SOUZA DA SILVA",
  "CARINE PEREIRA DOS SANTOS REIS",
  "WENNY BIANCA DOS SANTOS FARIA",
  "INGRYD OLIVEIRA MENDES DE BRITO"
];

// Helper to normalize string for comparison (remove accents, lowercase)
const normalizeStr = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const determineTimeSlot = (timeStr: string): TimeSlot | null => {
  if (!timeStr) return null;
  
  const [hours, minutes] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;

  // 10:00 = 600 minutes
  if (totalMinutes <= 600) return TimeSlot.EARLY;
  
  // 12:00 = 720 minutes
  if (totalMinutes <= 720) return TimeSlot.MORNING;
  
  // 14:00 = 840 minutes
  if (totalMinutes <= 840) return TimeSlot.LUNCH;
  
  // 16:00 = 960 minutes
  if (totalMinutes <= 960) return TimeSlot.AFTERNOON;
  
  return TimeSlot.LATE;
};

export const parseInputText = (text: string): ParsedRecord[] => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  return lines.map((line, index) => {
    const cleanLine = line.trim();
    const id = `rec-${index}`;

    // 1. Extract Time (HH:MM)
    const timeMatch = cleanLine.match(/\b([0-1]?[0-9]|2[0-3]):([0-5][0-9])\b/);
    const timeStr = timeMatch ? timeMatch[0] : null;

    // 2. Determine Status
    const lowerLine = cleanLine.toLowerCase();
    let status = RecordStatus.UNKNOWN;
    
    if (DONE_KEYWORDS.some(k => lowerLine.includes(k))) {
      status = RecordStatus.FINALIZADO;
    } else if (PENDING_KEYWORDS.some(k => lowerLine.includes(k))) {
      status = RecordStatus.PENDENTE;
    }

    // 3. Determine Expert Name
    let expertName = 'Desconhecido';
    const normalizedLine = normalizeStr(cleanLine);
    
    // Strategy A: Check if a Roster Name is fully contained in the line (Highest Confidence)
    const strictMatch = EXPERT_ROSTER.find(expert => normalizedLine.includes(normalizeStr(expert)));
    
    if (strictMatch) {
      expertName = strictMatch;
    } else {
      // Strategy B: Heuristic extraction + Fuzzy/Partial Roster Match
      // First, clean the line to isolate the potential name
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
        // Check if the extracted candidate is a substring of any Roster name (e.g. "Caio" -> "CAIO FELIPE...")
        const normCandidate = normalizeStr(candidateName);
        const potentialMatches = EXPERT_ROSTER.filter(r => normalizeStr(r).includes(normCandidate));

        if (potentialMatches.length === 1) {
          // Unique match found (e.g. "Caio" matches only one Caio)
          expertName = potentialMatches[0];
        } else {
          // No match or Ambiguous (multiple matches like "João") -> Use extracted name as is
          expertName = candidateName;
        }
      }
    }

    // 4. Determine Slot
    const timeSlot = timeStr ? determineTimeSlot(timeStr) : null;

    // 5. Validation Logic
    let isValid = true;
    let reason = '';

    if (!timeStr) {
      isValid = false;
      reason = 'Horário não identificado';
    } else if (status !== RecordStatus.FINALIZADO) {
      isValid = false; // For the purpose of the matrix, only finalized are "valid count"
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

  // 1. Initialize Matrix with all Roster Experts (ensure they appear even with 0 counts)
  EXPERT_ROSTER.forEach(name => {
    matrix[name] = {
      [TimeSlot.EARLY]: 0,
      [TimeSlot.MORNING]: 0,
      [TimeSlot.LUNCH]: 0,
      [TimeSlot.AFTERNOON]: 0,
      [TimeSlot.LATE]: 0,
    };
  });

  // 2. Populate with data
  records.forEach(record => {
    if (record.isValid && record.status === RecordStatus.FINALIZADO && record.timeSlot) {
      // If the expert was not in the roster (e.g. a name we couldn't match), initialize them now
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
  const headers = ['Expert', TimeSlot.EARLY, TimeSlot.MORNING, TimeSlot.LUNCH, TimeSlot.AFTERNOON, TimeSlot.LATE, 'TOTAL'];
  
  let md = `| ${headers.join(' | ')} |\n`;
  md += `| ${headers.map(() => '---').join(' | ')} |\n`;

  // Sort experts alphabetically for the report
  const experts = Object.keys(matrix).sort();

  experts.forEach((name) => {
    const slots = matrix[name];
    const total = Object.values(slots).reduce((a, b) => a + b, 0);
    const row = [
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