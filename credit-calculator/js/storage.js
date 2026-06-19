const STORAGE_KEY = 'credit_history';
const MAX_HISTORY = 5;

export function saveCalculation(calcData) {
    let history = getHistory();
    const record = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        ...calcData
    };
    history.unshift(record);
    if (history.length > MAX_HISTORY) history.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return history;
}

export function getHistory() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch(e) {
        return [];
    }
}

export function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
}

export function deleteHistoryItem(id) {
    let history = getHistory();
    history = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return history;
}