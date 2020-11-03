const inverse_phi = 1 / ((1 + Math.sqrt(5)) / 2)

function getScreenSize() {
    return innerWidth < innerHeight ? innerWidth : innerHeight
}

function patternToPoints(pattern) {
    let points = []

    for(let i = 0; i < pattern.length; i++) {
        points.push({x: pattern[i][0], y: pattern[i][1], index: i})
    }

    return points
}

function deepCopy(to_copy) {
    out = []

    to_copy.forEach(element => {
        out.push([element[0], element[1]])
    })

    return out
}

function getInfraredColor(step) {
    let i = floor(step * 4)

    if(step >= 1) {
        return infrared_colors[4]
    }

    return lerpColor(infrared_colors[i], infrared_colors[i+1], (step%0.25) / 0.25)
}

function getRandomElementFromArray(arr) {
    return arr[floor(random(arr.length))]
}