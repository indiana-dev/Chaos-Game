function getRandomPattern() {
    let pattern = _getRandomPattern() 

    if(random() < 0.2) {
        pattern.push([0.5,0.5])
    }

    return pattern
}

function _getRandomPattern() {
    switch(floor(random(9))) {
        case 0: return pattern_triangle_1
        case 1: let a = floor(random(10))
                let b = a + floor(random(5))
                return pattern_triangle_2(a/b)
        case 2: return pattern_square_1
        case 3: return pattern_square_2
        case 4: return pattern_square_3
        case 5: return pattern_fractal_square
        case 6: return pattern_pentagon()
        case 7: return pattern_hexagon()
        case 8: return pattern_polygon(floor(random(6, 12)))
    }
}

const pattern_triangle_1 = [[0,1], [1,1], [0.5,0]]

const pattern_triangle_2 = function(height) {
    let points = deepCopy(pattern_triangle_1)

    points.push([0.5, height])

    return points
}

const pattern_square_1 = [[0,0], [0,1], [1,0], [1,1]]
const pattern_square_2 = [[0,0], [1,0], [1,1], [0,1]]
const pattern_square_3 = [[0,0], [0,1], [1,0], [1,1], [0.5, 0.5]]

const pattern_fractal_square = [[0,0], [0.5,0], [1,0], [1,0.5], [1,1], [0.5,1], [0,1], [0,0.5]] 

const pattern_pentagon = function() {
    let points = []

    let x = 0.5
    let y = 0.5 + 1 / 20
    let radius = 0.5
    let offset = -PI/2
    let step = 2 * PI / 5

    for(var i = offset; i < 2 * PI + offset; i += step)
    {
        points.push([x + radius * cos(i), y + radius * sin(i)]);
    }

    return points
}

const pattern_hexagon = function () {
    let points = []

    let x = 0.5
    let y = 0.5
    let radius = 0.5
    let step = 2 * PI / 6

    for(var i = 0; i < 2 * PI; i += step)
    {
        points.push([x + radius * cos(i), y + radius * sin(i)]);

        if(points.length == 6) {
            break
        }
    }

    return points
}

const pattern_polygon = function(nb) {
    let points = []

    let x = 0.5
    let y = 0.5
    let radius = 0.5
    let step = 2 * PI / nb

    for(var i = 0; i < 2 * PI; i += step)
    {
        points.push([x + radius * cos(i), y + radius * sin(i)]);
    }

    return points
}

// const rule_test = {
//     condition: 'forbidden_zone',
//     value: {
//         radius: 0.24407678805687935,
//         x: 0.7419886348251907,
//         y: 0.4749053612566274
//     },
//     bug:0
// }

//(8) [Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2)],
// 0: (2) [1, 0.5]
// 1: (2) [0.8535533905932737, 0.8535533905932737]
// 2: (2) [0.5, 1]
// 3: (2) [0.14644660940672627, 0.8535533905932737]
// 4: (2) [0, 0.5000000000000001]
// 5: (2) [0.14644660940672616, 0.14644660940672627]
// 6: (2) [0.4999999999999999, 0]
// 7: (2) [0.8535533905932737, 0.14644660940672616]
//
// Rule {condition: "forbidden_zone", comparator: undefined, value: {…}, direction: undefined, else: undefined, …}
// bug: undefined
// comparator: undefined
// condition: "forbidden_zone"
// direction: undefined
// else: undefined
// value:
// radius: 0.24407678805687935
// x: 0.7419886348251907
// y: 0.4749053612566274

// 0: (2) [1, 0.5]
// 1: (2) [0.75, 0.9330127018922193]
// 2: (2) [0.2500000000000001, 0.9330127018922194]
// 3: (2) [0, 0.5000000000000001]
// 4: (2) [0.24999999999999978, 0.06698729810778076]
// 5: (2) [0.7499999999999997, 0.06698729810778048]
//
// bug: 1
// comparator: "!="
// condition: "distance"
// pattern: Point {pattern: Array(6), jump_length: 0.5, rule: Rule, last_edges: Array(2), x: 0.5799821673908749, …}
// value: 1