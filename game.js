class MathRush {
    constructor() {
        this.currentPlayer = '';
        this.currentAge = '';
        this.currentMode = '';
        this.currentLevel = 1;
        this.score = 0;
        this.streak = 0;
        this.questionCount = 0;
        this.totalQuestions = 10;
        this.timeLeft = 5;
        this.timerInterval = null;
        this.currentQuestion = null;
        this.correctAnswers = 0;
        this.totalTime = 0;
        this.questionStartTime = 0;
        
        this.initializeGame();
    }

    initializeGame() {
        this.bindEvents();
        this.loadLeaderboard();
        this.updateStartButton();
    }

    bindEvents() {
        // Eventos de configuración
        document.getElementById('playerName').addEventListener('input', () => this.updateStartButton());
        
        document.querySelectorAll('.age-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectAge(e.target.dataset.age));
        });
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectMode(e.target.dataset.mode));
        });
        
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        
        // Eventos de juego
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectAnswer(parseInt(e.target.dataset.option)));
        });
        
        // Eventos de resultados
        document.getElementById('playAgain').addEventListener('click', () => this.resetGame());
        document.getElementById('backToMenu').addEventListener('click', () => this.backToMenu());
        
        // Eventos de teclado
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    selectAge(age) {
        this.currentAge = age;
        document.querySelectorAll('.age-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`[data-age="${age}"]`).classList.add('selected');
        this.updateStartButton();
    }

    selectMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('selected');
        this.updateStartButton();
    }

    updateStartButton() {
        const name = document.getElementById('playerName').value.trim();
        const hasAge = this.currentAge !== '';
        const hasMode = this.currentMode !== '';
        const startBtn = document.getElementById('startGame');
        
        startBtn.disabled = !(name && hasAge && hasMode);
    }

    startGame() {
        this.currentPlayer = document.getElementById('playerName').value.trim();
        this.resetGameStats();
        this.showScreen('gameScreen');
        this.updateGameDisplay();
        this.generateQuestion();
        AudioManager.playSound('start');
    }

    resetGameStats() {
        this.score = 0;
        this.streak = 0;
        this.questionCount = 0;
        this.correctAnswers = 0;
        this.totalTime = 0;
        this.currentLevel = this.getInitialLevel();
    }

    getInitialLevel() {
        const ageRanges = {
            '6-8': 1,
            '9-11': 2,
            '12-14': 3,
            '15-16': 4
        };
        return ageRanges[this.currentAge] || 1;
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    updateGameDisplay() {
        document.getElementById('playerDisplay').textContent = this.currentPlayer;
        document.getElementById('levelDisplay').textContent = `Nivel ${this.currentLevel} • ${this.getAgeLabel()}`;
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
        document.getElementById('questionCounter').textContent = `Pregunta ${this.questionCount + 1} de ${this.totalQuestions}`;
        
        const progress = ((this.questionCount) / this.totalQuestions) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    getAgeLabel() {
        const labels = {
            '6-8': 'Principiante',
            '9-11': 'Intermedio',
            '12-14': 'Avanzado',
            '15-16': 'Experto'
        };
        return labels[this.currentAge] || 'Personalizado';
    }

    generateQuestion() {
        this.questionStartTime = Date.now();
        this.questionCount++;
        
        if (this.questionCount > this.totalQuestions) {
            this.endGame();
            return;
        }

        this.updateGameDisplay();
        
        if (this.currentMode === 'tables') {
            this.currentQuestion = this.generateMultiplicationQuestion();
        } else {
            this.currentQuestion = this.generateMixedQuestion();
        }
        
        this.displayQuestion();
        this.startTimer();
    }

    generateMixedQuestion() {
        const operations = ['+', '-', '×', '÷'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let num1, num2, correctAnswer;
        const difficulty = this.getDifficulty();
        
        switch (operation) {
            case '+':
                num1 = this.getRandomNumber(difficulty.min, difficulty.max);
                num2 = this.getRandomNumber(difficulty.min, difficulty.max);
                correctAnswer = num1 + num2;
                break;
            case '-':
                num1 = this.getRandomNumber(difficulty.min, difficulty.max);
                num2 = this.getRandomNumber(difficulty.min, Math.min(num1, difficulty.max));
                correctAnswer = num1 - num2;
                break;
            case '×':
                num1 = this.getRandomNumber(2, difficulty.multiply);
                num2 = this.getRandomNumber(2, difficulty.multiply);
                correctAnswer = num1 * num2;
                break;
            case '÷':
                correctAnswer = this.getRandomNumber(2, difficulty.divide);
                num2 = this.getRandomNumber(2, difficulty.divide);
                num1 = correctAnswer * num2;
                break;
        }
        
        return {
            question: `${num1} ${operation} ${num2}`,
            correctAnswer,
            options: this.generateOptions(correctAnswer, difficulty.range)
        };
    }

    generateMultiplicationQuestion() {
        const table = this.getRandomNumber(2, 12);
        const multiplier = this.getRandomNumber(1, 12);
        const correctAnswer = table * multiplier;
        
        return {
            question: `${table} × ${multiplier}`,
            correctAnswer,
            options: this.generateOptions(correctAnswer, 20)
        };
    }

    getDifficulty() {
        const difficulties = {
            1: { min: 1, max: 10, multiply: 5, divide: 5, range: 10 },
            2: { min: 1, max: 25, multiply: 8, divide: 8, range: 15 },
            3: { min: 1, max: 50, multiply: 12, divide: 10, range: 25 },
            4: { min: 1, max: 100, multiply: 15, divide: 12, range: 40 }
        };
        return difficulties[this.currentLevel] || difficulties[1];
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateOptions(correctAnswer, range) {
        const options = [correctAnswer];
        
        while (options.length < 4) {
            const offset = this.getRandomNumber(-range, range);
            const option = Math.max(0, correctAnswer + offset);
            
            if (!options.includes(option)) {
                options.push(option);
            }
        }
        
        // Mezclar opciones
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        return options;
    }

    displayQuestion() {
        document.getElementById('question').textContent = this.currentQuestion.question;
        
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach((btn, index) => {
            btn.textContent = this.currentQuestion.options[index];
            btn.classList.remove('correct', 'incorrect');
            btn.disabled = false;
        });
    }

    startTimer() {
        this.timeLeft = 5;
        this.updateTimer();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    updateTimer() {
        const timer = document.getElementById('timer');
        const percentage = (this.timeLeft / 5) * 360;
        
        timer.style.background = `conic-gradient(var(--primary) ${percentage}deg, #e0e0e0 ${percentage}deg)`;
        timer.textContent = this.timeLeft;
        
        if (this.timeLeft <= 2) {
            timer.classList.add('warning');
        } else {
            timer.classList.remove('warning');
        }
    }

    selectAnswer(optionIndex) {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        const selectedAnswer = this.currentQuestion.options[optionIndex];
        const isCorrect = selectedAnswer === this.currentQuestion.correctAnswer;
        
        this.processAnswer(isCorrect, optionIndex);
    }

    processAnswer(isCorrect, selectedIndex) {
        const optionBtns = document.querySelectorAll('.option-btn');
        const responseTime = (Date.now() - this.questionStartTime) / 1000;
        this.totalTime += responseTime;
        
        // Deshabilitar todos los botones
        optionBtns.forEach(btn => btn.disabled = true);
        
        if (isCorrect) {
            optionBtns[selectedIndex].classList.add('correct');
            this.correctAnswers++;
            this.streak++;
            
            // Calcular puntos basado en velocidad y racha
            const speedBonus = Math.max(0, Math.floor((5 - responseTime) * 10));
            const streakBonus = this.streak * 5;
            const points = 10 + speedBonus + streakBonus;
            
            this.score += points;
            this.showFeedback('correct', `+${points}`);
            AudioManager.playSound('correct');
            this.createParticles();
            
        } else {
            if (selectedIndex >= 0) {
                optionBtns[selectedIndex].classList.add('incorrect');
            }
            
            // Mostrar respuesta correcta
            optionBtns.forEach((btn, index) => {
                if (this.currentQuestion.options[index] === this.currentQuestion.correctAnswer) {
                    btn.classList.add('correct');
                }
            });
            
            this.streak = 0;
            this.showFeedback('incorrect', '¡Ups!');
            AudioManager.playSound('incorrect');
        }
        
        this.updateGameDisplay();
        
        // Continuar al siguiente pregunta después de un delay
        setTimeout(() => {
            this.generateQuestion();
        }, 1500);
    }

    timeUp() {
        clearInterval(this.timerInterval);
        this.processAnswer(false, -1);
    }

    showFeedback(type, text) {
        const feedback = document.createElement('div');
        feedback.className = `feedback ${type}`;
        feedback.textContent = text;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 1000);
    }

    createParticles() {
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.textContent = ['⭐', '✨', '🎉', '💫'][Math.floor(Math.random() * 4)];
                particle.style.left = Math.random() * window.innerWidth + 'px';
                particle.style.top = Math.random() * window.innerHeight + 'px';
                particle.style.fontSize = '2rem';
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    if (document.body.contains(particle)) {
                        document.body.removeChild(particle);
                    }
                }, 2000);
            }, i * 100);
        }
    }

    endGame() {
        clearInterval(this.timerInterval);
        this.calculateResults();
        this.saveScore();
        this.showResults();
        this.showScreen('resultScreen');
    }

    calculateResults() {
        const accuracy = Math.round((this.correctAnswers / this.totalQuestions) * 100);
        const averageTime = (this.totalTime / this.totalQuestions).toFixed(1);
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalAccuracy').textContent = `${accuracy}%`;
        document.getElementById('finalTime').textContent = `${averageTime}s`;
        
        // Determinar mensaje de resultado
        let resultIcon, resultTitle;
        
        if (accuracy >= 90) {
            resultIcon = '🏆';
            resultTitle = '¡Increíble! Eres un genio matemático';
        } else if (accuracy >= 70) {
            resultIcon = '🎉';
            resultTitle = '¡Excelente trabajo!';
        } else if (accuracy >= 50) {
            resultIcon = '👍';
            resultTitle = '¡Buen intento! Sigue practicando';
        } else {
            resultIcon = '💪';
            resultTitle = '¡No te rindas! La práctica hace al maestro';
        }
        
        document.getElementById('resultIcon').textContent = resultIcon;
        document.getElementById('resultTitle').textContent = resultTitle;
    }

    saveScore() {
        const scores = this.getStoredScores();
        const newScore = {
            name: this.currentPlayer,
            score: this.score,
            accuracy: Math.round((this.correctAnswers / this.totalQuestions) * 100),
            age: this.currentAge,
            mode: this.currentMode,
            date: new Date().toLocaleDateString()
        };
        
        scores.push(newScore);
        scores.sort((a, b) => b.score - a.score);
        scores.splice(5); // Mantener solo top 5
        
        localStorage.setItem('mathRushScores', JSON.stringify(scores));
        this.loadLeaderboard();
    }

    getStoredScores() {
        const stored = localStorage.getItem('mathRushScores');
        return stored ? JSON.parse(stored) : [];
    }

    loadLeaderboard() {
        const scores = this.getStoredScores();
        const container = document.getElementById('topScores');
        
        if (scores.length === 0) {
            container.innerHTML = '<p style="color: #666; font-style: italic;">No hay puntuaciones aún. ¡Sé el primero!</p>';
            return;
        }
        
        container.innerHTML = scores.map((score, index) => `
            <div class="score-entry">
                <span class="score-rank">#${index + 1}</span>
                <span class="score-name">${score.name}</span>
                <span class="score-points">${score.score} pts</span>
            </div>
        `).join('');
    }

    handleKeyPress(e) {
        if (document.getElementById('gameScreen').classList.contains('active')) {
            const key = e.key;
            if (['1', '2', '3', '4'].includes(key)) {
                const optionIndex = parseInt(key) - 1;
                this.selectAnswer(optionIndex);
            }
        }
    }

    resetGame() {
        this.resetGameStats();
        this.showScreen('gameScreen');
        this.updateGameDisplay();
        this.generateQuestion();
    }

    backToMenu() {
        this.showScreen('startScreen');
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    showResults() {
        AudioManager.playSound('finish');
    }
}

// Gestión de Audio
class AudioManager {
    static sounds = {
        correct: () => AudioManager.createTone(800, 0.1),
        incorrect: () => AudioManager.createTone(300, 0.2),
        start: () => AudioManager.createTone(600, 0.1),
        finish: () => AudioManager.playMelody([600, 700, 800], 0.15)
    };

    static createTone(frequency, duration) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.log('Audio no disponible');
        }
    }

    static playMelody(frequencies, noteDuration) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                AudioManager.createTone(freq, noteDuration);
            }, index * noteDuration * 1000);
        });
    }

    static playSound(soundName) {
        if (AudioManager.sounds[soundName]) {
            AudioManager.sounds[soundName]();
        }
    }
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new MathRush();
});