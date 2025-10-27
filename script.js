class ScientificCalculator {
    constructor() {
        this.display = {
            primary: document.getElementById('displayPrimary'),
            secondary: document.getElementById('displaySecondary')
        };
        
        this.state = {
            currentInput: '0',
            previousInput: '',
            operator: null,
            waitingForOperand: false,
            memory: 0,
            isScientificMode: true,
            history: [],
            angleMode: 'deg' // 'deg' or 'rad'
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupKeyboardSupport();
        this.updateDisplay();
    }

    initializeElements() {
        this.elements = {
            modeToggle: document.getElementById('modeToggle'),
            scientificFunctions: document.getElementById('scientificFunctions'),
            historyList: document.getElementById('historyList'),
            clearHistory: document.getElementById('clearHistory'),
            numberBtns: document.querySelectorAll('.number-btn'),
            operatorBtns: document.querySelectorAll('.operator-btn'),
            functionBtns: document.querySelectorAll('.function-btn'),
            memoryBtns: document.querySelectorAll('.memory-btn'),
            utilityBtns: document.querySelectorAll('.utility-btn'),
            equalsBtn: document.querySelector('.equals-btn')
        };
    }

    setupEventListeners() {
        // Mode toggle
        this.elements.modeToggle.addEventListener('click', () => this.toggleMode());

        // Number buttons
        this.elements.numberBtns.forEach(btn => {
            btn.addEventListener('click', () => this.inputNumber(btn.dataset.number));
        });

        // Operator buttons
        this.elements.operatorBtns.forEach(btn => {
            btn.addEventListener('click', () => this.inputOperator(btn.dataset.operator));
        });

        // Function buttons
        this.elements.functionBtns.forEach(btn => {
            btn.addEventListener('click', () => this.executeFunction(btn.dataset.function));
        });

        // Memory buttons
        this.elements.memoryBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleMemory(btn.dataset.memory));
        });

        // Utility buttons
        this.elements.utilityBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleUtility(btn.dataset.action));
        });

        // Equals button
        this.elements.equalsBtn.addEventListener('click', () => this.calculate());

        // History
        this.elements.clearHistory.addEventListener('click', () => this.clearHistory());
    }

    setupKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            
            // Numbers
            if (e.key >= '0' && e.key <= '9') {
                this.inputNumber(e.key);
            }
            // Operators
            else if (['+', '-', '*', '/'].includes(e.key)) {
                this.inputOperator(e.key);
            }
            // Decimal point
            else if (e.key === '.') {
                this.handleUtility('decimal');
            }
            // Enter or equals
            else if (e.key === 'Enter' || e.key === '=') {
                this.calculate();
            }
            // Backspace
            else if (e.key === 'Backspace') {
                this.handleUtility('backspace');
            }
            // Clear
            else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
                this.handleUtility('clear');
            }
            // Clear entry
            else if (e.key === 'Delete') {
                this.handleUtility('clearEntry');
            }
            
            this.animateButtonPress(e.key);
        });
    }

    animateButtonPress(key) {
        let selector = '';
        if (key >= '0' && key <= '9') {
            selector = `[data-number="${key}"]`;
        } else if (['+', '-', '*', '/'].includes(key)) {
            selector = `[data-operator="${key}"]`;
        } else if (key === 'Enter' || key === '=') {
            selector = '.equals-btn';
        }
        
        if (selector) {
            const btn = document.querySelector(selector);
            if (btn) {
                btn.classList.add('pressed');
                setTimeout(() => btn.classList.remove('pressed'), 100);
            }
        }
    }

    toggleMode() {
        this.state.isScientificMode = !this.state.isScientificMode;
        const modeText = document.getElementById('modeText');
        
        if (this.state.isScientificMode) {
            this.elements.scientificFunctions.classList.remove('hidden');
            modeText.textContent = 'Basic';
        } else {
            this.elements.scientificFunctions.classList.add('hidden');
            modeText.textContent = 'Scientific';
        }
    }

    inputNumber(num) {
        if (this.state.waitingForOperand) {
            this.state.currentInput = num;
            this.state.waitingForOperand = false;
        } else {
            this.state.currentInput = this.state.currentInput === '0' ? num : this.state.currentInput + num;
        }
        this.updateDisplay();
    }

    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.state.currentInput);

        if (this.state.previousInput === '') {
            this.state.previousInput = inputValue;
        } else if (this.state.operator) {
            const currentValue = this.state.previousInput || 0;
            const newValue = this.performCalculation(currentValue, inputValue, this.state.operator);

            this.state.currentInput = String(newValue);
            this.state.previousInput = newValue;
        }

        this.state.waitingForOperand = true;
        this.state.operator = nextOperator;
        
        // Update operator button states
        this.elements.operatorBtns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-operator="${nextOperator}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        this.updateDisplay();
    }

    calculate() {
        const inputValue = parseFloat(this.state.currentInput);

        if (this.state.previousInput !== '' && this.state.operator) {
            const newValue = this.performCalculation(this.state.previousInput, inputValue, this.state.operator);
            
            // Add to history
            this.addToHistory(`${this.state.previousInput} ${this.state.operator} ${inputValue} = ${newValue}`);
            
            this.state.currentInput = String(newValue);
            this.state.previousInput = '';
            this.state.operator = null;
            this.state.waitingForOperand = true;
            
            // Clear operator button states
            this.elements.operatorBtns.forEach(btn => btn.classList.remove('active'));
        }

        this.updateDisplay();
    }

    performCalculation(firstOperand, secondOperand, operator) {
        try {
            switch (operator) {
                case '+':
                    return firstOperand + secondOperand;
                case '-':
                    return firstOperand - secondOperand;
                case '*':
                    return firstOperand * secondOperand;
                case '/':
                    if (secondOperand === 0) {
                        throw new Error('Division by zero');
                    }
                    return firstOperand / secondOperand;
                default:
                    return secondOperand;
            }
        } catch (error) {
            this.showError('Error');
            return 0;
        }
    }

    executeFunction(func) {
        const currentValue = parseFloat(this.state.currentInput);
        let result;

        try {
            switch (func) {
                case 'sin':
                    result = Math.sin(this.toRadians(currentValue));
                    break;
                case 'cos':
                    result = Math.cos(this.toRadians(currentValue));
                    break;
                case 'tan':
                    result = Math.tan(this.toRadians(currentValue));
                    break;
                case 'asin':
                    result = this.toDegrees(Math.asin(currentValue));
                    break;
                case 'acos':
                    result = this.toDegrees(Math.acos(currentValue));
                    break;
                case 'atan':
                    result = this.toDegrees(Math.atan(currentValue));
                    break;
                case 'log':
                    if (currentValue <= 0) throw new Error('Invalid input for log');
                    result = Math.log10(currentValue);
                    break;
                case 'ln':
                    if (currentValue <= 0) throw new Error('Invalid input for ln');
                    result = Math.log(currentValue);
                    break;
                case 'exp':
                    result = Math.exp(currentValue);
                    break;
                case 'pow10':
                    result = Math.pow(10, currentValue);
                    break;
                case 'sqrt':
                    if (currentValue < 0) throw new Error('Invalid input for sqrt');
                    result = Math.sqrt(currentValue);
                    break;
                case 'cbrt':
                    result = Math.cbrt(currentValue);
                    break;
                case 'square':
                    result = currentValue * currentValue;
                    break;
                case 'cube':
                    result = currentValue * currentValue * currentValue;
                    break;
                case 'factorial':
                    if (currentValue < 0 || !Number.isInteger(currentValue)) {
                        throw new Error('Invalid input for factorial');
                    }
                    result = this.factorial(currentValue);
                    break;
                case 'reciprocal':
                    if (currentValue === 0) throw new Error('Division by zero');
                    result = 1 / currentValue;
                    break;
                case 'abs':
                    result = Math.abs(currentValue);
                    break;
                case 'pi':
                    result = Math.PI;
                    break;
                case 'e':
                    result = Math.E;
                    break;
                case 'power':
                    // This will be handled differently - set up for power operation
                    this.inputOperator('**');
                    return;
                default:
                    return;
            }

            // Add to history
            this.addToHistory(`${func}(${currentValue}) = ${result}`);
            
            this.state.currentInput = String(result);
            this.state.waitingForOperand = true;
            this.updateDisplay();
            
        } catch (error) {
            this.showError('Error');
        }
    }

    handleMemory(action) {
        const currentValue = parseFloat(this.state.currentInput);
        
        switch (action) {
            case 'mc':
                this.state.memory = 0;
                break;
            case 'mr':
                this.state.currentInput = String(this.state.memory);
                this.state.waitingForOperand = true;
                break;
            case 'mplus':
                this.state.memory += currentValue;
                break;
            case 'mminus':
                this.state.memory -= currentValue;
                break;
            case 'ms':
                this.state.memory = currentValue;
                break;
        }
        
        // Update memory button states
        this.elements.memoryBtns.forEach(btn => btn.classList.remove('active'));
        if (this.state.memory !== 0) {
            document.querySelector('[data-memory="mr"]').classList.add('active');
        }
        
        this.updateDisplay();
    }

    handleUtility(action) {
        switch (action) {
            case 'clear':
                this.state.currentInput = '0';
                this.state.previousInput = '';
                this.state.operator = null;
                this.state.waitingForOperand = false;
                this.elements.operatorBtns.forEach(btn => btn.classList.remove('active'));
                break;
            case 'clearEntry':
                this.state.currentInput = '0';
                this.state.waitingForOperand = false;
                break;
            case 'backspace':
                if (this.state.currentInput.length > 1) {
                    this.state.currentInput = this.state.currentInput.slice(0, -1);
                } else {
                    this.state.currentInput = '0';
                }
                break;
            case 'decimal':
                if (this.state.waitingForOperand) {
                    this.state.currentInput = '0.';
                    this.state.waitingForOperand = false;
                } else if (this.state.currentInput.indexOf('.') === -1) {
                    this.state.currentInput += '.';
                }
                break;
            case 'negate':
                if (this.state.currentInput !== '0') {
                    this.state.currentInput = this.state.currentInput.startsWith('-') 
                        ? this.state.currentInput.slice(1) 
                        : '-' + this.state.currentInput;
                }
                break;
        }
        this.updateDisplay();
    }

    factorial(n) {
        if (n > 170) throw new Error('Number too large for factorial');
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    toRadians(degrees) {
        return this.state.angleMode === 'deg' ? degrees * (Math.PI / 180) : degrees;
    }

    toDegrees(radians) {
        return this.state.angleMode === 'deg' ? radians * (180 / Math.PI) : radians;
    }

    updateDisplay() {
        // Format the number for display
        let displayValue = this.state.currentInput;
        
        // Handle very large or very small numbers
        const num = parseFloat(displayValue);
        if (!isNaN(num)) {
            if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
                displayValue = num.toExponential(6);
            } else if (displayValue.length > 12) {
                displayValue = parseFloat(displayValue).toPrecision(12);
            }
        }
        
        this.display.primary.textContent = displayValue;
        
        // Update secondary display
        if (this.state.operator && this.state.previousInput !== '') {
            this.display.secondary.textContent = `${this.state.previousInput} ${this.state.operator}`;
        } else {
            this.display.secondary.textContent = '';
        }
    }

    showError(message) {
        this.display.primary.textContent = message;
        this.display.primary.classList.add('error');
        setTimeout(() => {
            this.display.primary.classList.remove('error');
            this.handleUtility('clear');
        }, 2000);
    }

    addToHistory(calculation) {
        this.state.history.unshift(calculation);
        if (this.state.history.length > 10) {
            this.state.history.pop();
        }
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = this.elements.historyList;
        
        if (this.state.history.length === 0) {
            historyList.innerHTML = '<p class="history-empty">No calculations yet</p>';
            return;
        }
        
        historyList.innerHTML = this.state.history
            .map(item => `<div class="history-item" onclick="calculator.useHistoryItem('${item}')">${item}</div>`)
            .join('');
    }

    useHistoryItem(calculation) {
        // Extract the result from the calculation string
        const result = calculation.split(' = ')[1];
        if (result) {
            this.state.currentInput = result;
            this.state.waitingForOperand = true;
            this.updateDisplay();
        }
    }

    clearHistory() {
        this.state.history = [];
        this.updateHistoryDisplay();
    }
}

// Initialize calculator when DOM is loaded
let calculator;
document.addEventListener('DOMContentLoaded', () => {
    calculator = new ScientificCalculator();
});