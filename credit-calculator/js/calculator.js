// Аннуитетный платёж
export function calculateAnnuity(amount, annualRate, months) {
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) {
        const payment = amount / months;
        return {
            monthlyPayment: payment,
            totalPayment: amount,
            overpayment: 0,
            schedule: Array.from({ length: months }, (_, i) => ({
                month: i+1,
                payment: payment,
                principal: payment,
                interest: 0,
                balance: amount - payment * (i+1)
            }))
        };
    }
    const factor = Math.pow(1 + monthlyRate, months);
    const monthlyPayment = amount * (monthlyRate * factor) / (factor - 1);
    let balance = amount;
    let totalPayment = 0;
    let schedule = [];
    for (let i = 0; i < months; i++) {
        const interest = balance * monthlyRate;
        const principal = monthlyPayment - interest;
        balance -= principal;
        if (balance < 0) balance = 0;
        totalPayment += monthlyPayment;
        schedule.push({
            month: i+1,
            payment: monthlyPayment,
            principal: principal,
            interest: interest,
            balance: balance
        });
    }
    const overpayment = totalPayment - amount;
    return {
        monthlyPayment: monthlyPayment,
        totalPayment: totalPayment,
        overpayment: overpayment,
        schedule: schedule
    };
}

// Дифференцированный платёж
export function calculateDifferentiated(amount, annualRate, months) {
    const monthlyRate = annualRate / 12 / 100;
    const principalPart = amount / months;
    let balance = amount;
    let schedule = [];
    let totalPayment = 0;
    for (let i = 0; i < months; i++) {
        const interest = balance * monthlyRate;
        const payment = principalPart + interest;
        totalPayment += payment;
        schedule.push({
            month: i+1,
            payment: payment,
            principal: principalPart,
            interest: interest,
            balance: balance - principalPart
        });
        balance -= principalPart;
        if (balance < 0) balance = 0;
    }
    const overpayment = totalPayment - amount;
    // Для единообразия в поле monthlyPayment показываем первый платёж
    const firstPayment = schedule[0]?.payment || 0;
    return {
        monthlyPayment: firstPayment,
        totalPayment: totalPayment,
        overpayment: overpayment,
        schedule: schedule,
        isDifferentiated: true
    };
}