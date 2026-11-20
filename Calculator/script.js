const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const buttons = document.querySelectorAll('.btn');

let currentExpression = '';
let justEvaluated = false;

const operators = ['+', '-', '*', '/', '%'];

// Format internal operators (*, /) into clean display symbols (×, ÷)
function formatDisplay(expr) {
  return expr
    .replace(/\*/g, ' × ')
    .replace(/\//g, ' ÷ ')
    .replace(/\+/g, ' + ')
    .replace(/-/g, ' − ');
}

// Safely evaluate arithmetic expression without eval()
function calculate(expr) {
  // Strip trailing operator if user is mid-typing
  const sanitized = expr.replace(/[+\-*/%.]+$/, '');
  if (!sanitized) return '0';

  // Allow only digits, operators, decimals, and parentheses
  if (!/^[0-9+\-*/%.() ]+$/.test(sanitized)) return 'Error';

  try {
    // Convert percentages (e.g., 50% -> (50/100))
    const parsed = sanitized.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
    const value = Function(`"use strict"; return (${parsed})`)();

    if (!isFinite(value)) return 'Cannot divide by 0';
    // Round floating point inaccuracies (e.g., 0.1 + 0.2)
    return Number(Math.round(value + 'e10') + 'e-10').toString();
  } catch {
    return '';
  }
}

// Update screen with expression and real-time result preview
function updateScreen() {
  expressionEl.textContent = formatDisplay(currentExpression);

  if (!currentExpression) {
    resultEl.textContent = '0';
    resultEl.classList.remove('preview');
    return;
  }

  const liveResult = calculate(currentExpression);
  if (liveResult !== '') {
    resultEl.textContent = liveResult;
    resultEl.classList.toggle('preview', !justEvaluated);
  }
}

// Append numbers or operators
function appendValue(val) {
  const lastChar = currentExpression.slice(-1);

  if (justEvaluated) {
    // Start fresh if typing a number after '=', or continue chaining if typing an operator
    if (!operators.includes(val)) {
      currentExpression = '';
    }
    justEvaluated = false;
  }

  // Prevent consecutive operators (replace previous operator instead)
  if (operators.includes(val)) {
    if (!currentExpression && val !== '-') return;
    if (operators.includes(lastChar)) {
      currentExpression = currentExpression.slice(0, -1) + val;
      updateScreen();
      return;
    }
  }

  // Prevent multiple decimals in the same number segment
  if (val === '.') {
    const parts = currentExpression.split(/[+\-*/%]/);
    const currentNumber = parts[parts.length - 1];
    if (currentNumber.includes('.')) return;
    if (!currentNumber) currentExpression += '0';
  }

  currentExpression += val;
  updateScreen();
}

function clearAll() {
  currentExpression = '';
  justEvaluated = false;
  updateScreen();
}

function deleteLast() {
  if (justEvaluated) {
    justEvaluated = false;
  }
  currentExpression = currentExpression.slice(0, -1);
  updateScreen();
}

function evaluateFinal() {
  if (!currentExpression) return;
  const finalResult = calculate(currentExpression);
  if (finalResult === 'Cannot divide by 0' || finalResult === 'Error') {
    resultEl.textContent = finalResult;
    resultEl.classList.remove('preview');
    currentExpression = '';
    return;
  }
  if (finalResult !== '') {
    expressionEl.textContent = formatDisplay(currentExpression) + ' =';
    resultEl.textContent = finalResult;
    resultEl.classList.remove('preview');
    currentExpression = finalResult;
    justEvaluated = true;
  }
}

// Button Click Listeners
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const value = button.getAttribute('data-value');
    const action = button.getAttribute('data-action');

    if (value !== null) appendValue(value);
    if (action === 'clear') clearAll();
    if (action === 'delete') deleteLast();
    if (action === 'equals') evaluateFinal();
  });
});

// Keyboard Support with Visual Key Press Feedback
document.addEventListener('keydown', (e) => {
  const key = e.key;
  let matchingBtn = null;

  if (/^[0-9.]$/.test(key) || operators.includes(key)) {
    e.preventDefault();
    appendValue(key);
    matchingBtn = document.querySelector(`.btn[data-value="${key}"]`);
  } else if (key === 'Enter' || key === '=') {
    e.preventDefault();
    evaluateFinal();
    matchingBtn = document.querySelector('.btn[data-action="equals"]');
  } else if (key === 'Backspace') {
    e.preventDefault();
    deleteLast();
    matchingBtn = document.querySelector('.btn[data-action="delete"]');
  } else if (key === 'Escape' || key.toLowerCase() === 'c') {
    e.preventDefault();
    clearAll();
    matchingBtn = document.querySelector('.btn[data-action="clear"]');
  }

  if (matchingBtn) {
    matchingBtn.classList.add('active-key');
    setTimeout(() => matchingBtn.classList.remove('active-key'), 120);
  }
});