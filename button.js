

var counter = document.getElementById("button");
var count = 0;
var score = document.getElementById("score");

const onclick_handler = () => {
    count += 1;
    score.innerHTML = "Score:" + "  "+ count + "";
};

counter.onclick = onclick_handler;
var timer = 60;

var started = true;
counter.addEventListener('click', function() {
    console.log(timer);
    if (started){
    var myInterval = window.setInterval(function(){
    if (timer > 0)
        timer--;
        document.getElementById("timer").innerHTML = "Timer: " + timer;
    if (timer <= 0) {
        counter.setAttribute("disabled", "");
        clearInterval(myInterval);
    }
    }, 1000);
    started = false;
}
});

