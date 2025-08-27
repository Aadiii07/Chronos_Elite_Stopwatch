

class Stopwatch {
    constructor() {
        this.isRunning = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.intervalId = null;
        this.lapTimes = [];
        this.sessions = [];
        this.currentState = 'stopped'; // 'stopped', 'running', 'paused'
        this.sessionStartTime = 0;
        
        // Chart data
        this.chartData = [];
        this.currentTimeframe = '1m';
        this.lastUpdateTime = 0;
        this.priceHistory = [];
        this.volumeHistory = [];
        
        this.initializeElements();
        this.bindEvents();
        this.loadData();
        this.updateDisplay();
        this.updateStats();
        this.updateHeaderStats();
        this.initializeStockChart();
    }
    
    initializeElements() {
        this.hoursElement = document.getElementById('hours');
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        this.millisecondsElement = document.getElementById('milliseconds');
        
        this.mainBtn = document.getElementById('mainBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.lapBtn = document.getElementById('lapBtn');
        
        this.lapTimesContainer = document.getElementById('lapTimes');
        this.lapCountElement = document.getElementById('lapCount');
        this.historyList = document.getElementById('historyList');
        
        // Header stats elements
        this.totalSessionsElement = document.getElementById('totalSessions');
        this.totalTimeElement = document.getElementById('totalTime');
        
        // Stock chart elements
        this.priceChart = document.getElementById('priceChart');
        this.volumeChart = document.getElementById('volumeChart');
        this.chartOverlay = document.getElementById('chartOverlay');
        this.timeIndicator = document.getElementById('timeIndicator');
        this.currentPrice = document.getElementById('currentPrice');
        this.priceChange = document.getElementById('priceChange');
        this.volume = document.getElementById('volume');
        
        // Stats elements
        this.todayTotal = document.getElementById('todayTotal');
        this.todaySessions = document.getElementById('todaySessions');
        this.todayAverage = document.getElementById('todayAverage');
        this.weeklyTotal = document.getElementById('weeklyTotal');
        this.weeklySessions = document.getElementById('weeklySessions');
        this.weeklyAverage = document.getElementById('weeklyAverage');
        this.monthlyTotal = document.getElementById('monthlyTotal');
        this.monthlySessions = document.getElementById('monthlySessions');
        this.monthlyAverage = document.getElementById('monthlyAverage');
        
        // Tab elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Clear history button
        this.clearHistoryBtn = document.getElementById('clearHistory');
    }
    
    bindEvents() {
        this.mainBtn.addEventListener('click', () => this.toggleMainButton());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.lapBtn.addEventListener('click', () => this.recordLap());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // Timeframe selector
        document.querySelectorAll('.tf-btn').forEach(btn => {
            btn.addEventListener('click', () => this.changeTimeframe(btn.dataset.timeframe));
        });
        
        // Add button effects
        this.addButtonEffects();
    }
    
    addButtonEffects() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('mousedown', () => {
                btn.style.transform = 'scale(0.98)';
            });
            
            btn.addEventListener('mouseup', () => {
                btn.style.transform = '';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }
    
    initializeStockChart() {
        this.createChartGrid();
        this.updateChartDisplay();
        this.startChartAnimation();
    }
    
    createChartGrid() {
        // Create horizontal grid lines for price chart
        const priceChart = this.priceChart;
        priceChart.innerHTML = '';
        
        for (let i = 0; i <= 4; i++) {
            const gridLine = document.createElement('div');
            gridLine.className = 'grid-line horizontal';
            gridLine.style.top = `${(i * 25)}%`;
            priceChart.appendChild(gridLine);
            
            // Add price labels
            const priceLabel = document.createElement('div');
            priceLabel.className = 'price-label';
            priceLabel.style.top = `${(i * 25)}%`;
            priceLabel.style.transform = 'translateY(-50%)';
            priceLabel.textContent = this.formatTimeForChart((4 - i) * 15 * 60 * 1000); // 15 min intervals
            priceChart.appendChild(priceLabel);
        }
        
        // Create vertical grid lines
        for (let i = 0; i <= 8; i++) {
            const gridLine = document.createElement('div');
            gridLine.className = 'grid-line vertical';
            gridLine.style.left = `${(i * 12.5)}%`;
            priceChart.appendChild(gridLine);
        }
        
        // Create volume chart grid
        const volumeChart = this.volumeChart;
        volumeChart.innerHTML = '';
        
        for (let i = 0; i <= 2; i++) {
            const gridLine = document.createElement('div');
            gridLine.className = 'grid-line horizontal';
            gridLine.style.top = `${(i * 33.33)}%`;
            volumeChart.appendChild(gridLine);
        }
    }
    
    startChartAnimation() {
        // Simulate real-time price updates
        setInterval(() => {
            if (this.isRunning) {
                this.updateChartData();
            }
        }, 1000); // Update every second
    }
    
    updateChartData() {
        const now = Date.now();
        const timeDiff = now - this.lastUpdateTime;
        
        if (timeDiff >= this.getTimeframeInterval()) {
            this.lastUpdateTime = now;
            
            // Create new candlestick data
            const open = this.priceHistory.length > 0 ? this.priceHistory[this.priceHistory.length - 1] : 0;
            const close = this.elapsedTime;
            const high = Math.max(open, close);
            const low = Math.min(open, close);
            const volume = Math.floor(Math.random() * 100) + 50; // Simulated volume
            
            const candlestick = {
                open,
                high,
                low,
                close,
                volume,
                timestamp: now,
                isBullish: close > open
            };
            
            this.chartData.push(candlestick);
            this.priceHistory.push(close);
            this.volumeHistory.push(volume);
            
            // Keep only recent data based on timeframe
            const maxBars = this.getMaxBars();
            if (this.chartData.length > maxBars) {
                this.chartData.shift();
                this.priceHistory.shift();
                this.volumeHistory.shift();
            }
            
            this.updateChartDisplay();
            this.updateChartStats();
        }
    }
    
    getTimeframeInterval() {
        switch(this.currentTimeframe) {
            case '1m': return 60 * 1000; // 1 minute
            case '5m': return 5 * 60 * 1000; // 5 minutes
            case '15m': return 15 * 60 * 1000; // 15 minutes
            case '1h': return 60 * 60 * 1000; // 1 hour
            default: return 60 * 1000;
        }
    }
    
    getMaxBars() {
        switch(this.currentTimeframe) {
            case '1m': return 60; // 1 hour of data
            case '5m': return 72; // 6 hours of data
            case '15m': return 96; // 24 hours of data
            case '1h': return 168; // 1 week of data
            default: return 60;
        }
    }
    
    updateChartDisplay() {
        this.renderCandlesticks();
        this.renderVolumeBars();
        this.updateTimeIndicator();
    }
    
    renderCandlesticks() {
        const priceChart = this.priceChart;
        const chartHeight = 200;
        const chartWidth = priceChart.offsetWidth;
        
        // Clear existing candlesticks
        const existingCandlesticks = priceChart.querySelectorAll('.candlestick');
        existingCandlesticks.forEach(candle => candle.remove());
        
        if (this.chartData.length === 0) return;
        
        // Calculate price range
        const prices = this.priceHistory;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice || 1;
        
        // Calculate bar width
        const barWidth = Math.min(8, (chartWidth * 0.8) / this.chartData.length);
        const barSpacing = (chartWidth * 0.8) / this.chartData.length;
        
        this.chartData.forEach((candle, index) => {
            const candlestick = document.createElement('div');
            candlestick.className = `candlestick ${candle.isBullish ? 'bullish' : 'bearish'}`;
            
            // Position
            const x = (index * barSpacing) + (chartWidth * 0.1);
            candlestick.style.left = `${x}px`;
            candlestick.style.width = `${barWidth}px`;
            
            // Height and position based on price
            const openY = chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight;
            const closeY = chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight;
            const highY = chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight;
            const lowY = chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight;
            
            // Create candlestick body
            const body = document.createElement('div');
            body.className = 'candlestick-body';
            body.style.height = `${Math.abs(closeY - openY)}px`;
            body.style.top = `${Math.min(openY, closeY)}px`;
            candlestick.appendChild(body);
            
            // Create wick
            const wick = document.createElement('div');
            wick.className = 'candlestick-wick';
            wick.style.height = `${highY - lowY}px`;
            wick.style.top = `${lowY}px`;
            candlestick.appendChild(wick);
            
            priceChart.appendChild(candlestick);
        });
    }
    
    renderVolumeBars() {
        const volumeChart = this.volumeChart;
        const chartHeight = 100;
        const chartWidth = volumeChart.offsetWidth;
        
        // Clear existing volume bars
        const existingBars = volumeChart.querySelectorAll('.volume-bar');
        existingBars.forEach(bar => bar.remove());
        
        if (this.volumeHistory.length === 0) return;
        
        // Calculate volume range
        const volumes = this.volumeHistory;
        const maxVolume = Math.max(...volumes);
        
        // Calculate bar width
        const barWidth = Math.min(8, (chartWidth * 0.8) / this.volumeHistory.length);
        const barSpacing = (chartWidth * 0.8) / this.volumeHistory.length;
        
        this.volumeHistory.forEach((volume, index) => {
            const volumeBar = document.createElement('div');
            volumeBar.className = 'volume-bar';
            
            // Position
            const x = (index * barSpacing) + (chartWidth * 0.1);
            volumeBar.style.left = `${x}px`;
            volumeBar.style.width = `${barWidth}px`;
            
            // Height based on volume
            const height = (volume / maxVolume) * chartHeight;
            volumeBar.style.height = `${height}px`;
            
            volumeChart.appendChild(volumeBar);
        });
    }
    
    updateTimeIndicator() {
        if (this.chartData.length === 0) return;
        
        const priceChart = this.priceChart;
        const chartWidth = priceChart.offsetWidth;
        const currentIndex = this.chartData.length - 1;
        const barSpacing = (chartWidth * 0.8) / this.chartData.length;
        
        // Position indicator at current time
        const x = (currentIndex * barSpacing) + (chartWidth * 0.1);
        this.timeIndicator.style.left = `${x}px`;
    }
    
    updateChartStats() {
        if (this.chartData.length === 0) return;
        
        const currentCandle = this.chartData[this.chartData.length - 1];
        const previousCandle = this.chartData[this.chartData.length - 2];
        
        // Update current price
        this.currentPrice.textContent = this.formatTime(currentCandle.close);
        
        // Update price change
        if (previousCandle) {
            const change = currentCandle.close - previousCandle.close;
            const changeText = this.formatTime(Math.abs(change));
            this.priceChange.textContent = `${change >= 0 ? '+' : '-'}${changeText}`;
            this.priceChange.style.color = change >= 0 ? 'var(--bullish)' : 'var(--bearish)';
        } else {
            this.priceChange.textContent = '+00:00';
            this.priceChange.style.color = 'var(--neutral)';
        }
        
        // Update volume
        this.volume.textContent = currentCandle.volume;
    }
    
    changeTimeframe(timeframe) {
        // Update active button
        document.querySelectorAll('.tf-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-timeframe="${timeframe}"]`).classList.add('active');
        
        this.currentTimeframe = timeframe;
        this.lastUpdateTime = Date.now();
        
        // Clear existing data and restart
        this.chartData = [];
        this.priceHistory = [];
        this.volumeHistory = [];
        
        this.updateChartDisplay();
    }
    
    formatTimeForChart(time) {
        const minutes = Math.floor(time / (1000 * 60));
        const seconds = Math.floor((time % (1000 * 60)) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    toggleMainButton() {
        switch(this.currentState) {
            case 'stopped':
                this.start();
                break;
            case 'running':
                this.pause();
                break;
            case 'paused':
                this.resume();
                break;
        }
    }
    
    start() {
        this.isRunning = true;
        this.currentState = 'running';
        this.startTime = Date.now() - this.elapsedTime;
        this.sessionStartTime = Date.now();
        this.intervalId = setInterval(() => this.updateTime(), 10);
        
        this.updateMainButton('pause');
        this.resetBtn.disabled = false;
        this.lapBtn.disabled = false;
        
        // Add visual feedback
        this.addRunningAnimation();
        
        // Start chart updates
        this.lastUpdateTime = Date.now();
    }
    
    pause() {
        this.isRunning = false;
        this.currentState = 'paused';
        clearInterval(this.intervalId);
        this.elapsedTime = Date.now() - this.startTime;
        
        this.updateMainButton('resume');
        this.removeRunningAnimation();
    }
    
    resume() {
        this.start();
    }
    
    stop() {
        if (this.isRunning || this.elapsedTime > 0) {
            this.isRunning = false;
            this.currentState = 'stopped';
            clearInterval(this.intervalId);
            this.elapsedTime = Date.now() - this.startTime;
            
            // Save session
            this.saveSession();
            
            this.updateMainButton('start');
            this.resetBtn.disabled = true;
            this.lapBtn.disabled = true;
            this.removeRunningAnimation();
        }
    }
    
    reset() {
        this.isRunning = false;
        this.currentState = 'stopped';
        clearInterval(this.intervalId);
        this.elapsedTime = 0;
        this.lapTimes = [];
        this.startTime = 0;
        this.sessionStartTime = 0;
        
        // Clear chart data
        this.chartData = [];
        this.priceHistory = [];
        this.volumeHistory = [];
        
        this.updateMainButton('start');
        this.resetBtn.disabled = true;
        this.lapBtn.disabled = true;
        this.removeRunningAnimation();
        
        this.updateDisplay();
        this.updateLapDisplay();
        this.updateChartDisplay();
        this.updateChartStats();
    }
    
    updateMainButton(state) {
        const btnText = this.mainBtn.querySelector('.btn-text');
        const icon = this.mainBtn.querySelector('i');
        
        switch(state) {
            case 'start':
                btnText.textContent = 'Start';
                icon.className = 'fas fa-play';
                this.mainBtn.className = 'btn btn-main';
                break;
            case 'pause':
                btnText.textContent = 'Pause';
                icon.className = 'fas fa-pause';
                this.mainBtn.className = 'btn btn-main btn-pause';
                break;
            case 'resume':
                btnText.textContent = 'Resume';
                icon.className = 'fas fa-play';
                this.mainBtn.className = 'btn btn-main btn-resume';
                break;
        }
    }
    
    addRunningAnimation() {
        this.mainBtn.style.animation = 'pulse-running 1.5s ease-in-out infinite';
    }
    
    removeRunningAnimation() {
        this.mainBtn.style.animation = '';
    }
    
    recordLap() {
        if (this.isRunning) {
            const currentTime = Date.now() - this.startTime;
            const lapTime = {
                time: currentTime,
                display: this.formatTime(currentTime)
            };
            this.lapTimes.push(lapTime);
            this.updateLapDisplay();
            
            // Add visual feedback for lap recording
            this.addLapFeedback();
        }
    }
    
    addLapFeedback() {
        const lapBtn = this.lapBtn;
        lapBtn.style.transform = 'scale(1.05)';
        lapBtn.style.boxShadow = '0 0 20px rgba(8, 145, 178, 0.4)';
        
        setTimeout(() => {
            lapBtn.style.transform = '';
            lapBtn.style.boxShadow = '';
        }, 200);
    }
    
    updateTime() {
        this.elapsedTime = Date.now() - this.startTime;
        this.updateDisplay();
    }
    
    updateDisplay() {
        const time = this.elapsedTime;
        const hours = Math.floor(time / (1000 * 60 * 60));
        const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((time % (1000 * 60)) / 1000);
        const milliseconds = Math.floor((time % 1000) / 10);
        
        this.hoursElement.textContent = hours.toString().padStart(2, '0');
        this.minutesElement.textContent = minutes.toString().padStart(2, '0');
        this.secondsElement.textContent = seconds.toString().padStart(2, '0');
        this.millisecondsElement.textContent = milliseconds.toString().padStart(2, '0');
    }
    
    updateLapDisplay() {
        this.lapCountElement.textContent = this.lapTimes.length;
        
        if (this.lapTimes.length === 0) {
            this.lapTimesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-flag"></i>
                    </div>
                    <p>No lap times recorded yet</p>
                    <small>Click Lap while timing to record intermediate times</small>
                </div>
            `;
            return;
        }
        
        this.lapTimesContainer.innerHTML = '';
        this.lapTimes.forEach((lap, index) => {
            const lapElement = document.createElement('div');
            lapElement.className = 'lap-time';
            lapElement.innerHTML = `
                <span>Lap ${this.lapTimes.length - index}</span>
                <span>${lap.display}</span>
            `;
            this.lapTimesContainer.appendChild(lapElement);
        });
    }
    
    formatTime(time) {
        const hours = Math.floor(time / (1000 * 60 * 60));
        const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((time % (1000 * 60)) / 1000);
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    saveSession() {
        const session = {
            date: new Date().toISOString(),
            duration: this.elapsedTime,
            display: this.formatTime(this.elapsedTime),
            laps: [...this.lapTimes]
        };
        
        this.sessions.push(session);
        this.saveData();
        this.updateStats();
        this.updateHeaderStats();
        this.updateHistory();
    }
    
    switchTab(tabName) {
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }
    
    updateHeaderStats() {
        const totalSessions = this.sessions.length;
        const totalTime = this.sessions.reduce((sum, session) => sum + session.duration, 0);
        
        this.totalSessionsElement.textContent = totalSessions;
        this.totalTimeElement.textContent = this.formatTime(totalTime);
    }
    
    updateStats() {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const todaySessions = this.sessions.filter(session => 
            new Date(session.date) >= todayStart
        );
        
        const weeklySessions = this.sessions.filter(session => 
            new Date(session.date) >= weekStart
        );
        
        const monthlySessions = this.sessions.filter(session => 
            new Date(session.date) >= monthStart
        );
        
        // Today's stats
        const todayTotal = todaySessions.reduce((sum, session) => sum + session.duration, 0);
        this.todayTotal.textContent = this.formatTime(todayTotal);
        this.todaySessions.textContent = todaySessions.length;
        this.todayAverage.textContent = todaySessions.length > 0 ? 
            this.formatTime(todayTotal / todaySessions.length) : '00:00';
        
        // Weekly stats
        const weeklyTotal = weeklySessions.reduce((sum, session) => sum + session.duration, 0);
        this.weeklyTotal.textContent = this.formatTime(weeklyTotal);
        this.weeklySessions.textContent = weeklySessions.length;
        this.weeklyAverage.textContent = weeklySessions.length > 0 ? 
            this.formatTime(weeklyTotal / weeklySessions.length) : '00:00';
        
        // Monthly stats
        const monthlyTotal = monthlySessions.reduce((sum, session) => sum + session.duration, 0);
        this.monthlyTotal.textContent = this.formatTime(monthlyTotal);
        this.monthlySessions.textContent = monthlySessions.length;
        this.monthlyAverage.textContent = monthlySessions.length > 0 ? 
            this.formatTime(monthlyTotal / monthlySessions.length) : '00:00';
    }
    
    updateHistory() {
        if (this.sessions.length === 0) {
            this.historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-history"></i>
                    </div>
                    <p>No sessions recorded yet</p>
                    <small>Start timing to see your session history</small>
                </div>
            `;
            return;
        }
        
        const recentSessions = this.sessions.slice(-10).reverse();
        this.historyList.innerHTML = '';
        
        recentSessions.forEach(session => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const date = new Date(session.date);
            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            historyItem.innerHTML = `
                <span class="history-date">${dateStr}</span>
                <span class="history-duration">${session.display}</span>
            `;
            
            this.historyList.appendChild(historyItem);
        });
    }
    
    clearHistory() {
        if (confirm('Are you sure you want to clear all session history? This action cannot be undone.')) {
            this.sessions = [];
            this.saveData();
            this.updateStats();
            this.updateHeaderStats();
            this.updateHistory();
            
            // Add visual feedback
            this.addClearFeedback();
        }
    }
    
    addClearFeedback() {
        const clearBtn = this.clearHistoryBtn;
        clearBtn.style.transform = 'scale(1.02)';
        clearBtn.style.boxShadow = '0 0 20px rgba(220, 38, 38, 0.4)';
        
        setTimeout(() => {
            clearBtn.style.transform = '';
            clearBtn.style.boxShadow = '';
        }, 300);
    }
    
    saveData() {
        localStorage.setItem('stopwatchSessions', JSON.stringify(this.sessions));
    }
    
    loadData() {
        const savedSessions = localStorage.getItem('stopwatchSessions');
        if (savedSessions) {
            this.sessions = JSON.parse(savedSessions);
        }
    }
}

// Initialize the stopwatch when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Stopwatch();
});

// Add visual enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling for lap times
    const lapTimes = document.getElementById('lapTimes');
    if (lapTimes) {
        lapTimes.addEventListener('scroll', () => {
            lapTimes.style.boxShadow = 'inset 0 0 15px rgba(37, 99, 235, 0.1)';
            setTimeout(() => {
                lapTimes.style.boxShadow = 'none';
            }, 300);
        });
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                const mainBtn = document.getElementById('mainBtn');
                if (mainBtn) {
                    mainBtn.click();
                }
                break;
            case 'KeyL':
                const lapBtn = document.getElementById('lapBtn');
                if (lapBtn && !lapBtn.disabled) {
                    lapBtn.click();
                }
                break;
            case 'KeyR':
                const resetBtn = document.getElementById('resetBtn');
                if (resetBtn && !resetBtn.disabled) {
                    resetBtn.click();
                }
                break;
        }
    });
    
    // Add tooltips for keyboard shortcuts
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        let tooltip = '';
        if (btn.id === 'mainBtn') tooltip = 'Space';
        else if (btn.id === 'lapBtn') tooltip = 'L';
        else if (btn.id === 'resetBtn') tooltip = 'R';
        
        if (tooltip) {
            btn.title = `Keyboard shortcut: ${tooltip}`;
        }
    });
    
    // Add enhanced CSS animations for the stock market chart
    const style = document.createElement('style');
    style.textContent = `
        .btn-main.btn-pause {
            background: linear-gradient(135deg, #d97706, #b45309) !important;
            box-shadow: 0 0 25px rgba(217, 119, 6, 0.3) !important;
        }
        
        .btn-main.btn-resume {
            background: linear-gradient(135deg, #059669, #047857) !important;
            box-shadow: 0 0 25px rgba(5, 150, 105, 0.3) !important;
        }
        
        @keyframes pulse-running {
            0%, 100% { 
                transform: scale(1);
                box-shadow: 0 0 25px rgba(37, 99, 235, 0.3);
            }
            50% { 
                transform: scale(1.02);
                box-shadow: 0 0 35px rgba(37, 99, 235, 0.5);
            }
        }
        
        .time-circle {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .time-circle:hover {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(37, 99, 235, 0.2);
        }
        
        .stat-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .stopwatch-container,
        .stats-container {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .stopwatch-container:hover,
        .stats-container:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .candlestick {
            transition: all 0.3s ease;
        }
        
        .candlestick:hover {
            transform: scale(1.1);
            z-index: 10;
        }
        
        .volume-bar {
            transition: all 0.3s ease;
        }
        
        .volume-bar:hover {
            transform: scale(1.1);
            z-index: 10;
        }
        
        .time-indicator {
            animation: pulse-indicator 2s ease-in-out infinite;
        }
        
        @keyframes pulse-indicator {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
        }
        
        .tf-btn {
            transition: all 0.3s ease;
        }
        
        .tf-btn:hover {
            transform: translateY(-2px);
        }
        
        .tf-btn.active {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
    `;
    document.head.appendChild(style);
});
