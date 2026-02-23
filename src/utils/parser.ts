import { TimeSlot, RecordStatus, ParsedRecord, MatrixData, ExpertInfo } from '../types';

// Keywords that indicate a finished task
const DONE_KEYWORDS = ['finalizado', 'resolvido', 'vendido', 'concluido', 'concluído', 'encerrado', 'ok'];
// Keywords that indicate a pending task
const PENDING_KEYWORDS = ['tratativa', 'pendente', 'andamento', 'analise', 'análise', 'aguardando'];

// Helper to normalize string for comparison (remove accents, lowercase)
const normalizeStr = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const capitalizeWords = (str: string) => {
  return str.replace(/\b\w/g, l => l.toUpperCase());
};

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

export const parseInputText = (text: string, expertList: ExpertInfo[]): ParsedRecord[] => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const expertRoster = expertList.map(e => e.name);

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

    const strictMatch = expertRoster.find(expert => normalizedLine.includes(normalizeStr(expert)));

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
        const potentialMatches = expertRoster.filter(r => normalizeStr(r).includes(normCandidate));

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

export const calculateMatrix = (records: ParsedRecord[], expertList: ExpertInfo[]): MatrixData => {
  const matrix: MatrixData = {};
  const expertRoster = expertList.map(e => e.name);

  expertRoster.forEach(name => {
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

export const generateMarkdownTable = (matrix: MatrixData, expertList: ExpertInfo[]): string => {
  const headers = ['Matrícula', 'Expert', TimeSlot.EARLY, TimeSlot.MORNING, TimeSlot.LUNCH, TimeSlot.AFTERNOON, TimeSlot.LATE, 'TOTAL'];

  let md = `| ${headers.join(' | ')} |\n`;
  md += `| ${headers.map(() => '---').join(' | ')} |\n`;

  const experts = Object.keys(matrix).sort();

  // Create a map for quick lookup locally in this function
  const expertMap = expertList.reduce((acc, expert) => {
    acc[expert.name] = expert;
    return acc;
  }, {} as Record<string, ExpertInfo>);

  experts.forEach((name) => {
    const slots = matrix[name];
    const info = expertMap[name];
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