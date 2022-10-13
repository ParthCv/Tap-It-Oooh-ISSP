

var counter = document.getElementById("button");
var count = 0;
var score = document.getElementById("score");

const onclick_handler = () => {
    count += 1;
    score.innerHTML = "Score:" + "  "+ count + "";
};

const move_around = () => {
    var x = Math.floor(Math.random() * 500);
    var y = Math.floor(Math.random() * 500);
    counter.style.left = x + "px";
    counter.style.top = y + "px";
};

counter.onclick = onclick_handler; move_around();
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

// counter.addEventListener("click", moveHover);
// function moveHover(event){
//     var x = Math.floor(Math.random() * 500)+1;
//     var y = Math.floor(Math.random() * 500)+1;
//     counter.style.top = x + "px";
//     counter.style.left = y + "px";

// }

