/* =====================================
   1. DOM Elements
===================================== */

const choiceButtons = document.querySelectorAll(".choice-btn");

const playerScoreElement = document.getElementById("playerScore");

const computerScoreElement = document.getElementById("computerScore");

const resultText = document.getElementById("resultText");

const resultMessage = document.getElementById("resultMessage");

const resetButton = document.getElementById("resetBtn");

const playAgainButton = document.getElementById("playAgainBtn");

const modeButtons = document.querySelectorAll(".mode-btn");

const matchProgress = document.getElementById("matchProgress");

const playerProgressBar = document.getElementById("playerProgressBar");

const computerProgressBar = document.getElementById("computerProgressBar");


/* Statistics DOM Elements */

const totalMatchesElement = document.getElementById("totalMatches");

const totalWinsElement = document.getElementById("totalWins");

const totalLossesElement = document.getElementById("totalLosses");

const totalDrawsElement = document.getElementById("totalDraws");

const resetStatsButton = document.getElementById("resetStatsBtn");

/* Game History DOM Elements */

const historyTableBody = document.getElementById("historyTableBody");

const clearHistoryButton = document.getElementById("clearHistoryBtn");
const gameHistoryToggleButton = document.getElementById("gameHistoryToggleBtn");
const gameHistorySection = document.getElementById("gameHistorySection");




/* Audio Elements */

const backgroundMusic = document.getElementById("backgroundMusic");

const musicToggleBtn = document.getElementById("musicToggleBtn");

const musicVolume = document.getElementById("musicVolume");

const soundToggleBtn = document.getElementById("soundToggleBtn");

const soundVolume = document.getElementById("soundVolume");

/* =====================================
   2. Game Variables
===================================== */

let playerScore = 0;

let computerScore = 0;

let winningScore = 3;

let gameOver = false;

const choices = ["rock", "paper", "scissors"];


/* Statistics Data */

let gameStatistics = {
    totalMatches: 0,
    wins: 0,
    losses: 0,
    draws: 0
};

/* Audio Variables */

let soundEffectsEnabled = true;

let musicManuallyDisabled = false;

let audioContext = null;


/* =====================================
   GAME STATISTICS SYSTEM
===================================== */

// Save Statistics in Local Storage

function saveStatistics() {
    localStorage.setItem(
        "rps-statistics",
        JSON.stringify(gameStatistics)
    );
}

// Update Statistics on Screen

function updateStatisticsDisplay() {
    totalMatchesElement.textContent = gameStatistics.totalMatches;
    totalWinsElement.textContent = gameStatistics.wins;
    totalLossesElement.textContent = gameStatistics.losses;
    totalDrawsElement.textContent = gameStatistics.draws;
}

// Load Saved Statistics

function loadStatistics() {
    const savedStatistics = localStorage.getItem("rps-statistics");

    if (savedStatistics) {
        try {
            const parsedStatistics = JSON.parse(savedStatistics);

            gameStatistics = {
                totalMatches: Math.max(0, Number(parsedStatistics.totalMatches) || 0),
                wins: Math.max(0, Number(parsedStatistics.wins) || 0),
                losses: Math.max(0, Number(parsedStatistics.losses) || 0),
                draws: Math.max(0, Number(parsedStatistics.draws) || 0)
            };
        } catch (error) {
            console.error("Unable to load game statistics:", error);
        }
    }

    updateStatisticsDisplay();
}

// Reset All Game Statistics

function resetStatistics() {
    const confirmReset = confirm(
        "Are you sure you want to reset all game statistics?"
    );

    if (!confirmReset) {
        return;
    }

    gameStatistics = {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        draws: 0
    };

    saveStatistics();
    updateStatisticsDisplay();
}


/* =====================================
   GAME HISTORY SYSTEM
===================================== */

let gameHistory = [];

function saveGameHistory() {
    localStorage.setItem(
        "rps-game-history",
        JSON.stringify(gameHistory)
    );
}

function loadGameHistory() {
    try {
        const savedHistory = localStorage.getItem("rps-game-history");

        if (savedHistory) {
            const parsedHistory = JSON.parse(savedHistory);

            gameHistory = Array.isArray(parsedHistory)
                ? parsedHistory.slice(0, 100)
                : [];
        }
    } catch (error) {
        console.error("Unable to load game history:", error);
        gameHistory = [];
    }

    updateGameHistoryDisplay();
}

function addGameHistory(winner) {
    const matchRecord = {
        id: Date.now(),
        playerScore: playerScore,
        computerScore: computerScore,
        winner: winner,
        date: new Date().toLocaleString("en-IN")
    };

    gameHistory.unshift(matchRecord);

    gameHistory = gameHistory.slice(0, 100);

    saveGameHistory();
    updateGameHistoryDisplay();
}

function updateGameHistoryDisplay() {
    historyTableBody.replaceChildren();

    if (gameHistory.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "empty-history";
        cell.textContent = "No match history yet. Play your first match!";

        row.appendChild(cell);
        historyTableBody.appendChild(row);

        return;
    }

    gameHistory.forEach((match, index) => {
        const row = document.createElement("tr");

        const values = [
            `#${gameHistory.length - index}`,
            match.playerScore,
            match.computerScore,
            match.winner === "player" ? "🏆 You Won" : "🤖 Computer Won",
            match.date
        ];

        values.forEach((value, cellIndex) => {
            const cell = document.createElement("td");

            cell.textContent = String(value);

            if (cellIndex === 3) {
                cell.className = match.winner === "player"
                    ? "history-winner-player"
                    : "history-winner-computer";
            }

            row.appendChild(cell);
        });

        historyTableBody.appendChild(row);
    });
}

function toggleGameHistory() {
    const isHidden = gameHistorySection.hidden;

    gameHistorySection.hidden = !isHidden;

    gameHistoryToggleButton.setAttribute(
        "aria-expanded",
        String(isHidden)
    );

    gameHistoryToggleButton.textContent =
        isHidden ? "Hide History" : "Game History";

    if (isHidden) {
        requestAnimationFrame(() => {
            gameHistorySection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    }
}

function clearGameHistory() {
    const confirmClear = confirm(
        "Are you sure you want to clear all game history?"
    );

    if (!confirmClear) {
        return;
    }

    gameHistory = [];

    saveGameHistory();
    updateGameHistoryDisplay();
}


/* =====================================
   AUDIO SYSTEM
===================================== */

// Background Music Play

function startBackgroundMusic() {

    backgroundMusic.volume = Number(musicVolume.value);

    backgroundMusic.play()
        .then(() => {
            musicToggleBtn.textContent = "⏸ Pause Music";
        })
        .catch(() => {
            musicToggleBtn.textContent = "▶ Play Music";
        });

}


// Background Music Toggle

function toggleBackgroundMusic() {

    if (backgroundMusic.paused) {

        musicManuallyDisabled = false;

        startBackgroundMusic();

    } else {

        musicManuallyDisabled = true;

        backgroundMusic.pause();

        musicToggleBtn.textContent = "▶ Play Music";

    }

}


// Background Music Volume

function updateMusicVolume() {

    backgroundMusic.volume = Number(musicVolume.value);

}


// Create Audio Context

function getAudioContext() {

    if (!audioContext) {

        audioContext = new (
            window.AudioContext || window.webkitAudioContext
        )();

    }

    if (audioContext.state === "suspended") {

        audioContext.resume();

    }

    return audioContext;

}


// Play One Tone

function playTone(frequency, startTime, duration, volume = 0.2) {

    if (!soundEffectsEnabled || Number(soundVolume.value) === 0) {
        return;
    }

    const context = getAudioContext();

    const oscillator = context.createOscillator();

    const gain = context.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
        frequency,
        startTime
    );

    gain.gain.setValueAtTime(0, startTime);

    gain.gain.linearRampToValueAtTime(
        volume * Number(soundVolume.value),
        startTime + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        startTime + duration
    );

    oscillator.connect(gain);

    gain.connect(context.destination);

    oscillator.start(startTime);

    oscillator.stop(startTime + duration);

}


// Game Sound Effects

function playGameSound(type) {

    if (!soundEffectsEnabled) {
        return;
    }

    const context = getAudioContext();

    const now = context.currentTime;

    const sounds = {

        choice: [500],

        win: [500, 700, 900],

        lose: [500, 350, 220],

        draw: [400, 400],

        celebration: [500, 650, 800, 1000, 1200]

    };

    const frequencies = sounds[type];

    if (!frequencies) {
        return;
    }

    frequencies.forEach((frequency, index) => {

        playTone(
            frequency,
            now + index * 0.15,
            0.25,
            0.25
        );

    });

}


// Sound Effects Toggle

function toggleSoundEffects() {

    soundEffectsEnabled = !soundEffectsEnabled;

    soundToggleBtn.textContent = soundEffectsEnabled
        ? "Sound Effects: ON"
        : "Sound Effects: OFF";

}


// Sound Effects Volume

function updateSoundVolume() {

    Number(soundVolume.value);

}

/* =====================================
   3. Computer Random Choice
===================================== */

function getComputerChoice() {

    const randomIndex = Math.floor(Math.random() * choices.length);

    return choices[randomIndex];

}


/* =====================================
   4. Winner Detection
===================================== */

function getWinner(playerChoice, computerChoice) {

    if (playerChoice === computerChoice) {

        return "draw";

    }

    if (
        (playerChoice === "rock" && computerChoice === "scissors") ||
        (playerChoice === "paper" && computerChoice === "rock") ||
        (playerChoice === "scissors" && computerChoice === "paper")
    ) {

        return "player";

    }

    return "computer";

}


/* =====================================
   5. Play Game
===================================== */

function playGame(event) {

    if (gameOver) {
        return;
    }

    if (!musicManuallyDisabled && backgroundMusic.paused) {
        startBackgroundMusic();
    }

    const playerChoice = event.currentTarget.dataset.choice;

    const computerChoice = getComputerChoice();

    const winner = getWinner(playerChoice, computerChoice);


    playGameSound("choice");

    if (winner === "draw") {

        playGameSound("draw");
        // Update Draw Statistics

        gameStatistics.draws++;

        saveStatistics();
        updateStatisticsDisplay();

        resultText.textContent = "It's a Draw! 🤝";

        resultMessage.textContent =
            `Both selected ${playerChoice}. Try Again!`;

    }

    else if (winner === "player") {

        playGameSound("win");

        playerScore++;

        resultText.textContent = "You Win! 🎉";

        resultMessage.textContent =
            `You selected ${playerChoice} and Computer selected ${computerChoice}.`;

    }

    else {

        playGameSound("lose");

        computerScore++;

        resultText.textContent = "Computer Wins! 🤖";

        resultMessage.textContent =
            `You selected ${playerChoice} and Computer selected ${computerChoice}.`;

    }


    updateScore();

    checkMatchWinner();

}


/* =====================================
   6. Update Score
===================================== */

function updateScore() {

    playerScoreElement.textContent = playerScore;

    computerScoreElement.textContent = computerScore;

    updateProgress();

}


/* =====================================
   7. Update Match Progress
===================================== */

function updateProgress() {

    const playerProgress = (playerScore / winningScore) * 100;

    const computerProgress = (computerScore / winningScore) * 100;

    playerProgressBar.style.width = `${playerProgress}%`;

    computerProgressBar.style.width = `${computerProgress}%`;

    matchProgress.textContent =
        `First to ${winningScore} wins | ${Math.max(0, winningScore - playerScore)} wins needed for you`;

}


/* =====================================
   8. Check Match Winner
===================================== */

function checkMatchWinner() {

    if (playerScore >= winningScore) {

        endGame("player");

    }

    else if (computerScore >= winningScore) {

        endGame("computer");

    }

}



/* =====================================
   WINNER CELEBRATION
===================================== */

function startWinnerCelebration() {

    document.getElementById("winnerCelebration")?.remove();

    const celebration = document.createElement("div");
    celebration.id = "winnerCelebration";
    celebration.className = "winner-celebration";
    celebration.setAttribute("aria-hidden", "true");

    const message = document.createElement("div");
    message.className = "celebration-message";
    message.textContent = "🏆 YOU ARE THE CHAMPION! 🏆";
    celebration.appendChild(message);

    // Colorful confetti
    for (let i = 0; i < 90; i++) {
        const piece = document.createElement("span");
        piece.className = "celebration-confetti";
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.animationDelay = `${Math.random() * 2.2}s`;
        piece.style.animationDuration = `${2.5 + Math.random() * 2.5}s`;
        piece.style.setProperty(
            "--confetti-rotation",
            `${Math.random() * 720}deg`
        );
        celebration.appendChild(piece);
    }

    // Flying balloons
    for (let i = 0; i < 6; i++) {
        const balloon = document.createElement("span");
        balloon.className = "celebration-balloon";
        balloon.textContent = "🎈";
        balloon.style.left = `${8 + i * 16}%`;
        balloon.style.animationDelay = `${i * 0.25}s`;
        balloon.style.animationDuration = `${4.5 + (i % 3)}s`;
        celebration.appendChild(balloon);
    }

    // Rockets and fireworks
    [12, 34, 66, 88].forEach((position, index) => {

        const rocket = document.createElement("span");
        rocket.className = "celebration-rocket";
        rocket.textContent = "🚀";
        rocket.style.left = `${position}%`;
        rocket.style.animationDelay = `${index * 0.35}s`;
        celebration.appendChild(rocket);

        const burst = document.createElement("span");
        burst.className = "celebration-firework";
        burst.style.left = `${position}%`;
        burst.style.top = `${18 + (index % 2) * 22}%`;
        burst.style.animationDelay = `${1.1 + index * 0.35}s`;
        celebration.appendChild(burst);
    });

    document.body.appendChild(celebration);

    // Victory music and rocket/firework sound effects
    playGameSound("celebration");

    [420, 620, 850, 1120, 1450].forEach((frequency, index) => {
        playTone(
            frequency,
            getAudioContext().currentTime + 0.55 + index * 0.16,
            0.22,
            0.3
        );
    });

    // Winner voice announcement
    if (
        "speechSynthesis" in window &&
        soundEffectsEnabled &&
        Number(soundVolume.value) > 0
    ) {
        window.speechSynthesis.cancel();

        const announcement = new SpeechSynthesisUtterance(
            "Congratulations! You are the winner! Amazing victory!"
        );

        announcement.lang = "en-US";
        announcement.rate = 1.08;
        announcement.pitch = 1.15;
        announcement.volume = Math.min(1, Number(soundVolume.value));

        window.speechSynthesis.speak(announcement);
    }

    // Remove celebration after seven seconds
    window.setTimeout(() => {
        celebration.remove();
    }, 7000);
}


/* =====================================
   9. End Game
===================================== */

function endGame(winner) {

    gameOver = true;

    // Update Game Statistics

    gameStatistics.totalMatches++;

    if (winner === "player") {
        gameStatistics.wins++;
    } else {
        gameStatistics.losses++;
    }

    saveStatistics();
    updateStatisticsDisplay();

    // Save Completed Match in Game History
    addGameHistory(winner);

    choiceButtons.forEach((button) => {

        button.disabled = true;

    });


    if (winner === "player") {

        startWinnerCelebration();

        resultText.textContent = "🏆 You Won the Match!";

        resultMessage.textContent =
            `Congratulations! You won ${playerScore} - ${computerScore}.`;

    }

    else {

        resultText.textContent = "🤖 Computer Won the Match!";

        resultMessage.textContent =
            `Better luck next time! Final Score: ${playerScore} - ${computerScore}.`;

    }


    matchProgress.textContent = "Match Completed!";

    playAgainButton.hidden = false;

}


/* =====================================
   10. Reset Game
===================================== */

function resetGame() {

    playerScore = 0;

    computerScore = 0;

    gameOver = false;

    choiceButtons.forEach((button) => {

        button.disabled = false;

    });

    playAgainButton.hidden = true;

    resultText.textContent = "Make Your Move!";

    resultMessage.textContent =
        "Choose Rock, Paper or Scissors to start playing.";

    updateScore();

}


/* =====================================
   11. Change Game Mode
===================================== */

function changeGameMode(event) {

    winningScore = Number(event.currentTarget.dataset.target);

    modeButtons.forEach((button) => {

        const isActive = button === event.currentTarget;

        button.classList.toggle("active", isActive);

        button.setAttribute("aria-pressed", String(isActive));

    });

    resetGame();

    updateProgress();

}


/* =====================================
   12. Event Listeners
===================================== */

choiceButtons.forEach((button) => {

    button.addEventListener("click", playGame);

});

/* Keyboard Controls */

document.addEventListener("keydown", (event) => {

    // Ignore shortcuts while typing in input fields.
    if (
        event.target.matches("input, textarea, select") ||
        event.target.isContentEditable
    ) {
        return;
    }

    const key = event.key.toLowerCase();

    const keyChoices = {
        r: "rock",
        p: "paper",
        s: "scissors"
    };

    if (key === "escape" && !gameHistorySection.hidden) {
        toggleGameHistory();
        return;
    }

    const selectedChoice = keyChoices[key];

    if (!selectedChoice) {
        return;
    }

    const selectedButton = document.querySelector(
        `.choice-btn[data-choice="${selectedChoice}"]`
    );

    if (selectedButton && !selectedButton.disabled) {
        selectedButton.click();
    }

});



resetButton.addEventListener("click", resetGame);

resetStatsButton.addEventListener("click", resetStatistics);

clearHistoryButton.addEventListener("click", clearGameHistory);
gameHistoryToggleButton.addEventListener("click", toggleGameHistory);



// Audio Event Listeners

musicToggleBtn.addEventListener(
    "click",
    toggleBackgroundMusic
);

musicVolume.addEventListener(
    "input",
    updateMusicVolume
);

soundToggleBtn.addEventListener(
    "click",
    toggleSoundEffects
);

soundVolume.addEventListener(
    "input",
    updateSoundVolume
);
playAgainButton.addEventListener("click", resetGame);


modeButtons.forEach((button) => {

    button.addEventListener("click", changeGameMode);

});


/* =====================================
   13. Theme Settings
===================================== */

const themeToggleBtn = document.getElementById("themeToggleBtn");

function applyTheme(theme) {

    const isLightMode = theme === "light";

    document.body.classList.toggle("light-mode", isLightMode);

    themeToggleBtn.textContent = isLightMode
        ? "☀️ Switch to Dark Mode"
        : "🌙 Switch to Light Mode";

    themeToggleBtn.setAttribute(
        "aria-pressed",
        String(isLightMode)
    );

}

function initializeTheme() {

    const savedTheme = localStorage.getItem("rps-theme") || "dark";

    applyTheme(savedTheme === "light" ? "light" : "dark");

}

themeToggleBtn.addEventListener("click", () => {

    const isCurrentlyLight =
        document.body.classList.contains("light-mode");

    const newTheme = isCurrentlyLight ? "dark" : "light";

    applyTheme(newTheme);

    localStorage.setItem("rps-theme", newTheme);

});


/* =====================================
   13. Initialize Game
===================================== */

updateScore();

loadStatistics();

loadGameHistory();


initializeTheme();


