document.addEventListener("DOMContentLoaded", () => {
    const object = document.getElementById("object");
    const panel = document.getElementById("panel");
    const scoreHtml = document.getElementById("score");
    const timer = document.getElementById("timer");
    const play = document.getElementById("play");
    const popup = document.getElementById("popup");

    let score = 0;
    let timerStart = 30;
    let intervalId = null;
    let gameRunning = false;
    let init = 3;
    let intervalStart = null;

    let audioCtx;
    let soundBuffers = {};

    let lastTouch = 0;

    document.addEventListener('touchstart', function(e) {
        const now = new Date().getTime();
        if (now - lastTouch <= 300) {
            e.preventDefault();
        }
        lastTouch = now;
    }, { passive: false });


    async function loadSound(name, url) {
        if (!audioCtx) {
            audioCtx = new window.AudioContext();
        }
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await audioCtx.decodeAudioData(arrayBuffer);
        soundBuffers[name] = buffer;    
    }

    loadSound("click", "assets/sounds/click.wav");
    loadSound("bip", "assets/sounds/bip.wav");
    loadSound("whistle", "assets/sounds/whistle.wav");

    function playSound(name) {
        if (!soundBuffers[name]) return;

        const source = audioCtx.createBufferSource();
        source.buffer = soundBuffers[name];
        source.connect(audioCtx.destination);
        source.start(0);
    }

    function setObjectImage(url) {
        object.style.backgroundImage = `url(${url})`;
        object.style.backgroundSize = "cover";
        object.style.backgroundPosition = "center";
        object.style.backgroundRepeat = "no-repeat";
    }

    function changeObject() {
        const index = Math.floor(Math.random() * 5) + 1;

        setObjectImage(`assets/object/${index}.png`);
    }


    play.addEventListener("click", initGame)

    object.addEventListener("click", () => {
        if (!gameRunning) return;

        changeObject();

        playSound("click");

        const maxX = panel.clientWidth - object.offsetWidth;
        const maxY = panel.clientHeight - object.offsetHeight;

        const x = Math.floor(Math.random() * maxX);
        const y = Math.floor(Math.random() * maxY);

        object.style.left = `${x}px`;
        object.style.top = `${y}px`;

        addScore();
    })

    function addScore() {
        score++;

        scoreHtml.textContent = `Pontuação: ${score}`
    }

    function initGame() {
        if (gameRunning) return;

        popup.style.display = "block";

        init = 3;
        score = 0;
        timerStart = 30;
        popup.textContent = `${init}`;
        scoreHtml.textContent = `Pontuação: ${score}`;
        timer.textContent = `Tempo: ${timerStart} s`;

        play.style.background = "linear-gradient(180deg, rgb(0, 10, 0), rbg(0, 0, 10))";

        if (intervalStart) clearInterval(intervalStart);

        playSound("bip");

        intervalStart = setInterval(() => {
            init--;

            if (init > 0) {
                popup.textContent = `${init}`;
                playSound("bip");
            } else {
                clearInterval(intervalStart);
                popup.style.display = "none";
                startGame();
            }

        }, 1000);
    }

    function startGame() {
        if (intervalId) clearInterval(intervalId);

        gameRunning = true;

        changeObject();

        playSound("whistle");

        intervalId = setInterval(() => {
            timerStart--;
            timer.textContent = `Tempo: ${timerStart} s`;

            if (timerStart <= 0) {
                clearInterval(intervalId);
                gameRunning = false;
                play.style.backgroundColor = `linear-gradient(45deg, black, gray)`;
                object.style.backgroundImage = "none";
                playSound("whistle");
            }
        }, 1000);
    }
})