/**
 * Tells whether your are in creator mode
 * @param {o3h} o3h - the o3h class
 * @returns {boolean} - true if you are in creator mode, otherwise false
 */
 module.exports.isCreatorMode = (o3h) => {
    return o3h.Instance.playType === o3h.PlayType.Creator;
}

/**
 * Tells whether your are in audience mode
 * @param {o3h} o3h - the o3h class
 * @returns {boolean} - true if you are in audience mode, otherwise false
 */
module.exports.isAudienceMode = (o3h) => {
    return o3h.Instance.playType === o3h.PlayType.Audience;
}

/**
 * Returns a promise that resolves after the provided time
 * @param {Number} millis - the wait time in milliseconds
 * @returns {Promise} - A promise that resolves after the provided wait time
 */
module.exports.sleep = async (millis) => {
    return new Promise((resolve) => {
        window.setTimeout(() => { resolve(); }, millis);
    });
}

/**
 * Computes the average of two points in the form {x, y}
 * @param {object} point1 - the first point to average.
 * @param {object} point2 - the second point to average.
 * @returns {object} - The average of the two points in the form {x, y}
 */
module.exports.averagePoints = (point1, point2) => {
    return {
        x: (point1.x + point2.x) / 2,
        y: (point1.y + point2.y) / 2
    }
}

/**
 * Provides a random integer between 0 and max (inclusive)
 * @param max - inclusive upper limit
 * @returns {number} - the random integer
 */
module.exports.randomInt = (max) => {
    return Math.floor(Math.random() * (max + 1));
}

/**
 * Gets the next available number, or desiredNumber if it is available.
 * For example, say we have 10 cells, and cells 0, 3, and 4 are occupied.
 * If we want to place an item in cell 3, the next available one will be 5.
 * @param {Number} desiredNumber - the number we want to get closest to
 * @param {Array} unavailableNumbers - an array of numbers that are not available
 * @param {Number} limit - the biggest number possible in the set of all numbers
 * @returns - desiredNumber, if its not in unavailableNumbers, or the next sequential number, or null if no numbers available.
 */
module.exports.getNextAvailableNumber = (desiredNumber, unavaibleNumbers, limit) => {
    // iterate over every possible number if necessary, starting with desiredNumber,
    // trying to find one that isn't in unavailableNumbers
    for (let i = 0; i < limit; i++) {
        // get the next number, wrapping back to 0 if we run past limit
        const thisNumber = (desiredNumber + i) % limit;

        if (!unavaibleNumbers.includes(thisNumber)) {
            // hurray, it's available!
            return thisNumber;
        }
    }

    return undefined;
}

/**
 * Gets the center of the given DOM element, in the form {x, y}
 * @param {HTMLElement} element - the DOM element to find the center of
 * @returns {object} - the center of the DOM element in the form {x, y}
 */
module.exports.getElementCenter = (element) => {
    const rect = element.getBoundingClientRect();
    return { centerX: rect.x + rect.width / 2, centerY: rect.y + rect.height / 2 };
}

/**
 * Adds a class to the given DOM element, then removes it after the provided time has elapsed.
 * Helps facilitate animations that can be restarted later.
 * @param {HTMLElement} element - the DOM element to add the class to
 * @param {string} className - the css class to add to the element
 * @param {Number} removeAfterMs - how long to wait, in milliseconds, before removing the class
 */
module.exports.addThenRemoveClass = (element, className, removeAfterMs) => {
    return new Promise(resolve => {
        element.classList.add(className);
        window.setTimeout(() => {
            element.classList.remove(className);
            resolve();
        }, removeAfterMs);
    });
}

/**
 * Shuffles an array
 * @param {Array} arr - the array to shuffle
 * @returns {Array} - a shuffled copy of the array
 */
module.exports.randomShuffleArray = (arr) => {
    // taken from superluminary's answer on from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    return arr
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}


