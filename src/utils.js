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

export function showElement(name, displayType = "block") {
    document.getElementById(name).style.display = displayType;
}

export function hideElement(name) {
    document.getElementById(name).style.display = "none";
}
