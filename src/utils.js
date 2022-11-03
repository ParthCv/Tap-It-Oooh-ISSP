export function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function sleepProg(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
    currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

export function show(name) {
    document.querySelector(name).classList.add("hidden");
}

export function hide(name) {
    document.querySelector(name).classList.remove("hidden");
}
