/**
 * Converte strings de tempo de ligação (ex: "00:15:00", "15:30", "15 min", "1h 20m", "45") para segundos.
 */
export const parseTimeToSeconds = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const clean = timeStr.trim().toLowerCase();
    if (!clean) return 0;

    // Formato HH:MM:SS ou MM:SS
    if (clean.includes(':')) {
        const parts = clean.split(':').map(p => parseFloat(p.trim()) || 0);
        if (parts.length === 3) {
            // HH:MM:SS
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        if (parts.length === 2) {
            // MM:SS
            return parts[0] * 60 + parts[1];
        }
    }

    // Texto explícito com horas, minutos ou segundos
    const hoursMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:h|hora|horas)/i);
    const minsMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:m|min|minuto|minutos)/i);
    const secsMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:s|seg|segundo|segundos)/i);

    if (hoursMatch || minsMatch || secsMatch) {
        let total = 0;
        if (hoursMatch) total += parseFloat(hoursMatch[1]) * 3600;
        if (minsMatch) total += parseFloat(minsMatch[1]) * 60;
        if (secsMatch) total += parseFloat(secsMatch[1]);
        return total;
    }

    // Apenas número (assume minutos)
    const num = parseFloat(clean);
    if (!isNaN(num)) {
        return num * 60;
    }

    return 0;
};

/**
 * Formata segundos para formato legível (ex: "1h 25m", "45min", "30s").
 */
export const formatSecondsToHuman = (totalSeconds: number): string => {
    if (!totalSeconds || totalSeconds <= 0) return '0min';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    if (minutes > 0) {
        return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}min`;
    }
    return `${seconds}s`;
};
