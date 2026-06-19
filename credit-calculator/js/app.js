import { calculateAnnuity, calculateDifferentiated } from './calculator.js';
import { saveCalculation, getHistory, clearHistory, deleteHistoryItem } from './storage.js';
import { renderPieChart } from './chart.js';

// DOM элементы
const amountInput = document.getElementById('amount');
const rateInput = document.getElementById('rate');
const monthsInput = document.getElementById('months');
const paymentTypeSelect = document.getElementById('paymentType');
const calcBtn = document.getElementById('calcBtn');
const saveHistoryBtn = document.getElementById('saveHistoryBtn');
const resetBtn = document.getElementById('resetBtn');
const themeToggle = document.getElementById('themeToggle');
const resultsDiv = document.getElementById('results');
const monthlyPaymentSpan = document.getElementById('monthlyPayment');
const totalPaymentSpan = document.getElementById('totalPayment');
const overpaymentSpan = document.getElementById('overpayment');
const paymentTableBody = document.getElementById('paymentTableBody');
const historyContainer = document.getElementById('historyContainer');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

let currentCalculation = null;

// Форматирование рублей
function formatMoney(value) {
    return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
}

// Отображение результатов
function displayResults(calc, type, amount, rate, months) {
    monthlyPaymentSpan.innerText = formatMoney(calc.monthlyPayment);
    totalPaymentSpan.innerText = formatMoney(calc.totalPayment);
    overpaymentSpan.innerText = formatMoney(calc.overpayment);
    
    renderPieChart(amount, calc.overpayment);
    
    const schedule = calc.schedule;
    paymentTableBody.innerHTML = '';
    const maxRows = 6;
    for (let i = 0; i < Math.min(schedule.length, maxRows); i++) {
        addTableRow(schedule[i]);
    }
    if (schedule.length > maxRows) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="text-center text-gray-400">...</td>`;
        paymentTableBody.appendChild(row);
        addTableRow(schedule[schedule.length-1]);
    }
    
    resultsDiv.classList.remove('hidden');
    
    currentCalculation = {
        amount, rate, months, type,
        monthlyPayment: calc.monthlyPayment,
        totalPayment: calc.totalPayment,
        overpayment: calc.overpayment
    };
}

function addTableRow(item) {
    const row = document.createElement('tr');
    row.className = 'border-b dark:border-gray-700';
    row.innerHTML = `
        <td class="px-3 py-2 text-center">${item.month}</td>
        <td class="px-3 py-2 text-right">${formatMoney(item.payment)}</td>
        <td class="px-3 py-2 text-right">${formatMoney(item.principal)}</td>
        <td class="px-3 py-2 text-right">${formatMoney(item.interest)}</td>
        <td class="px-3 py-2 text-right">${formatMoney(item.balance)}</td>
    `;
    paymentTableBody.appendChild(row);
}

// Основной расчёт
function calculate() {
    const amount = parseFloat(amountInput.value);
    const rate = parseFloat(rateInput.value);
    const months = parseInt(monthsInput.value);
    
    if (isNaN(amount) || amount <= 0) { alert('Введите корректную сумму (больше 0)'); return; }
    if (amount > 10000000) { alert('Сумма не должна превышать 10 000 000 ₽'); return; }
    if (isNaN(rate) || rate < 0) { alert('Ставка не может быть отрицательной'); return; }
    if (rate > 30) { alert('Ставка не должна превышать 30%'); return; }
    if (isNaN(months) || months <= 0 || months > 600) { alert('Срок должен быть от 1 до 600 месяцев'); return; }
    
    const type = paymentTypeSelect.value;
    let result;
    if (type === 'annuity') {
        result = calculateAnnuity(amount, rate, months);
    } else {
        result = calculateDifferentiated(amount, rate, months);
    }
    displayResults(result, type, amount, rate, months);
}

// Сохранить в историю
function saveCurrentToHistory() {
    if (!currentCalculation) {
        alert('Сначала выполните расчёт (нажмите "Рассчитать")');
        return;
    }
    saveCalculation(currentCalculation);
    renderHistory();
    alert('Расчёт сохранён в историю');
}

// Отрисовка истории
function renderHistory() {
    const history = getHistory();
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="text-gray-500">Нет сохранённых расчётов</p>';
        return;
    }
    historyContainer.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center flex-wrap gap-2';
        div.innerHTML = `
            <div class="text-sm">
                <span class="font-semibold">${item.timestamp}</span><br>
                Сумма: ${formatMoney(item.amount)} | ${item.rate}% | ${item.months} мес.<br>
                Платёж: ${formatMoney(item.monthlyPayment)} | Переплата: ${formatMoney(item.overpayment)}
            </div>
            <button class="delete-history text-red-500 hover:text-red-700 text-xs" data-id="${item.id}">
                <i class="fas fa-trash-alt"></i> Удалить
            </button>
        `;
        historyContainer.appendChild(div);
    });
    document.querySelectorAll('.delete-history').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            deleteHistoryItem(id);
            renderHistory();
        });
    });
}

// Сброс
function resetForm() {
    amountInput.value = '500000';
    rateInput.value = '12';
    monthsInput.value = '24';
    paymentTypeSelect.value = 'annuity';
    resultsDiv.classList.add('hidden');
    currentCalculation = null;
}

// Тёмная тема
function initTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) document.body.classList.add('dark');
    updateThemeButton();
}
function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeButton();
}
function updateThemeButton() {
    const isDark = document.body.classList.contains('dark');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i> Светлая' : '<i class="fas fa-moon"></i> Тёмная';
}

// Инициализация событий
calcBtn.addEventListener('click', calculate);
saveHistoryBtn.addEventListener('click', saveCurrentToHistory);
resetBtn.addEventListener('click', resetForm);
themeToggle.addEventListener('click', toggleTheme);
clearHistoryBtn.addEventListener('click', () => {
    clearHistory();
    renderHistory();
});

// Загрузка истории и темы при старте
renderHistory();
initTheme();
// Выполняем первый расчёт для демонстрации (опционально)
setTimeout(() => calculate(), 100);