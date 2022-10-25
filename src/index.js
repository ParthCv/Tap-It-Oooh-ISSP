function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function incrementScore () {
    let score = Number(document.getElementById("score").innerHTML);
    document.getElementById("score").innerHTML = ++score;
}

async function startTimer(ms) {
    stopped = false;
    let stopTimerButton = document.getElementById("stop-button");

    stopTimerButton.addEventListener("click", function() {
        stopped = true;
    }, {once: true});

    while (ms > 0 && !stopped) {
        ms -= 100;
        await sleep(100);
        document.getElementById("timer").innerHTML = "Timer: " + Math.floor(ms / 1000);
    }

    return ms;
}

function createTimer(ms) {
    document.getElementById("timer").innerHTML = "Timer: " + Math.floor(ms / 1000);
}

function main() {
    window.onload = (event) => {
        numberOfMiliseconds = 60000;
        createTimer(numberOfMiliseconds);

        started = false;
        let startTimerButton = document.getElementById("start-button");

        startTimerButton.addEventListener("click", function() {
            if(started) {
                return;
            }
            started = true;
            startTimer(numberOfMiliseconds).then(function (promise) {
                numberOfMiliseconds = promise;
                started = false;
            });
        });  
    };
};

main();
