const gui = new dat.GUI({name: "My GUI"})
const gpu = new GPU()

let transparency = 0.4
let pt_count = 10000
let draw_mode = 1 // 0: stopped, 1: playing, 2: paused, 3: free draw

const pattern_triangle_1 = [[0,1], [1,1], [0.5,0]]
const pattern_triangle_2 = function(height) {
    let points = deepCopy(pattern_triangle_1)

    points.push([0.5, height])
    print(height)

    return points
}

const pattern_square = [[0,0], [0,1], [1,0], [1,1], [0.5, 0.5]]

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

function setup() {
    screen_size = innerHeight
    createCanvas(screen_size, screen_size)
    colorMode(RGB, 1)
    
    pattern = deepCopy(pattern_triangle_1)

    randomizeColors()
    initColors()
    initGUI()
    initAll()
}

function initGUI() {
    let pattern_names = ['triangle', 'triangle+', 'square', 'pentagon', 'hexagon', 'free draw']

    gui_controller = {
        pause: onPauseContinueButtonPressed, 
        stop: onStartStopButtonPressed,
        transparency: transparency, 
        speed: pt_count, 
        pattern: pattern_names[0],
        randomize_colors: onRandomizeColorsButtonPressed
    }

    ss_triangle_2_controller = {
        height: '2/3'
    }

    ss_freedraw_controller = {
        clear: onSSFreeDrawClearButtonPressed
    }

    pattern_controller = gui.add(gui_controller, 'pattern', pattern_names)
        .onFinishChange(onPatternControllerFinishChange)

    transparency_controller = gui.add(gui_controller, 'transparency', 0.05, 1, 0.01)
    speed_controller = gui.add(gui_controller, 'speed', 1, 10000, 1)
    randomize_colors_controller = gui.add(gui_controller, 'randomize_colors')
        .name('Randomize colors')

    // Special Settings triangle_2
    special_settings_triangle_2 = gui.addFolder("Special settings")
    special_settings_triangle_2.hide()
    
    ss_triangle_2_height_controller = special_settings_triangle_2.add(ss_triangle_2_controller, 'height')
        .onFinishChange(onSSTriangleChangeFinish)
        .name('Mid point height')

    // Special Settings freedraw
    speciall_settings_freedraw = gui.addFolder("Special settings ")
    speciall_settings_freedraw.hide()

    ss_freedraw_clear = speciall_settings_freedraw.add(ss_freedraw_controller, 'clear')
        .name("Clear points")

    createPauseContinueButton()
    createStartStopButton()
}

function createStartStopButton() {
    start_stop_button = gui.add(gui_controller, 'stop')
        .name("Stop")
}

function destroyStartStopButton() {
    try {
        gui.remove(start_stop_button)
    } catch { }
}

function createPauseContinueButton() {
    pause_continue_button = gui.add(gui_controller, 'pause')
        .name("Pause")
}

function destroyPauseContinueButton() {
    try {
        gui.remove(pause_continue_button)
    } catch { }
}

function deactivateAllSpecialSettings() {
    special_settings_triangle_2.hide()
    speciall_settings_freedraw.hide()
}

function onStartStopButtonPressed() {
    if(draw_mode == 0) {
        draw_mode = 1

        destroyStartStopButton()
        createPauseContinueButton()
        createStartStopButton()

        if(gui_controller.pattern == "free draw") {
            return
        }
    } else if(draw_mode == 1) {
        draw_mode = 0

        start_stop_button.name('Start')
        destroyPauseContinueButton()
        background(bg_color)
    } else if(draw_mode == 3) {
        if(pattern.length > 2) {
            draw_mode = 1

            destroyStartStopButton()
            createPauseContinueButton()
            createStartStopButton()

            initParameters()
            initPoints()
            initKernel()
        }

        return
    }

    initParameters()
    changePattern()
}

function onPauseContinueButtonPressed() {
    if(draw_mode == 1) {
        draw_mode = 2

        pause_continue_button.name('Continue')
    } else if(draw_mode == 2) {
        draw_mode = 1

        pause_continue_button.name('Pause')
    }
}

function onSSFreeDrawClearButtonPressed() {
    pattern = []
    print("cleared")
}

function onSSTriangleChangeFinish() {
    if(getSSTriangleHeight() == null) {
        ss_triangle_2_height_controller.setValue("1/2")
    }

    if(draw_mode == 0) {
        changePattern()
    }
}

function getSSTriangleHeight() {
    let fraction_regexp = /^\d+[\/]\d+$/m

    let result = fraction_regexp.exec(ss_triangle_2_height_controller.getValue())

    if(result == null) {
        return null
    } else {
        return eval(result[0])
    }
}

function onPatternControllerFinishChange() {
    deactivateAllSpecialSettings()

    changePattern() 
}

function changePattern() {
    if(draw_mode == 3) {
        draw_mode = 0
    }

    switch(gui_controller.pattern) {
        case 'triangle': pattern = deepCopy(pattern_triangle_1)
        break
        case 'triangle+': 
            pattern = pattern_triangle_2(getSSTriangleHeight())
            special_settings_triangle_2.show()
            special_settings_triangle_2.open()
        break
        case 'square': pattern = deepCopy(pattern_square)
        break
        case 'pentagon': pattern = pattern_pentagon()
        break
        case 'hexagon': pattern = pattern_hexagon()
        break
        case 'free draw': 
            draw_mode = 3
            pattern = []
            speciall_settings_freedraw.show()
            speciall_settings_freedraw.open()

            start_stop_button.name('Start')
            destroyPauseContinueButton()
            background(bg_color)
        return
    }

    initAll()
}

function draw() {
    if(draw_mode == 1) {
        points = movePoints(points, pattern, pattern.length)
        drawPoints()
    } else if(draw_mode == 0 || draw_mode == 3) {
        drawPatternEdges()
    }
}

function mouseClicked() {
    if(draw_mode == 3 || (draw_mode == 1 && gui_controller.pattern == 'free draw')) {
        if(mouseX > 0 && mouseX < screen_size && mouseY > 0 && mouseY < screen_size) {
            pattern.push([mouseX, mouseY])
            initKernel()
        }
    }
}

// function updateColors() {
//     let last_bg_color = bg_color
//     let last_fg_color = fg_color

//     randomizeColors()
//     loadPixels()
//     let d = pixelDensity()

//     for(let y = 0; y < screen_size; y++) {
//         for(let x = 0; x < screen_size; x++) {
//             let index = (y * screen_size + x) * d * 4
//             let bg_red = red(last_bg_color)
//             let fg_red = red(last_fg_color)
//             let pix_red = pixels[index]

//             // y - y0 = (x - x0) * (y1 - y0) / (x1 - x0)
//             // (x - x0) = (y - y0) * (x1 - x0) / (y1 - y0)
//             // (x - 0) = (y - bg_red) * (1 - 0) / (fg_red - bg_red)
//             // x = (pix_red - bg_red) / (fg_red - bg_red)

//             let interp = (pix_red - bg_red) / (fg_red - bg_red)
//             let new_color = color(0)//lerpColor(bg_red, fg_red, interp)

//             pixels[index] = red(new_color)
//             pixels[index + 1] = green(new_color)
//             pixels[index + 1] = blue(new_color)
//             pixels[index + 1] = 1
//         }
//     }

//     updatePixels()
// }

function onRandomizeColorsButtonPressed() {
    randomizeColors()
    initColors()
}

function randomizeColors() {
    fg_color = color(random(), random(), random())
    bg_color = color(random(), random(), random())
}


function initParameters() {
    pt_count = gui_controller.speed
    transparency = gui_controller.transparency

    initColors()
}

function initColors() {
    fg_color.setAlpha(transparency)
    stroke(fg_color)
    strokeWeight(1)

    background(bg_color)
}

function initAll() {
    background(bg_color)
    initPattern()
    initPoints()
    initKernel() 
}

function initPattern() {
    pattern.forEach(element => {
        element[0] *= screen_size
        element[1] *= screen_size
    })
}

function initPoints() {
    points = []

    for(let i = 0; i < pt_count; i++) {
        points.push(pattern[floor(random(pattern.length))])
    }
}

function initKernel() {
    movePoints = gpu.createKernel(function(points, pattern, size) {
        let curr_index = this.thread.x * 2
        let curr_x = points[curr_index]
        let curr_y = points[curr_index + 1]

        let next_index = Math.floor(Math.random() * size)
        let next_x = pattern[next_index][0]
        let next_y = pattern[next_index][1]

        let next_point = [(curr_x + next_x) / 2, (curr_y + next_y) / 2]

        return next_point
    }).setOutput([pt_count])

    movePointsRandomly = gpu.createKernel(function(screen_size) {
        let x = Math.floor(Math.random() * screen_size)
        let y = Math.floor(Math.random() * screen_size)

        return [x, y]
    }).setOutput([pt_count])
}

function drawPoints() {
    points.forEach(element => {
        point(element[0], element[1])
    })
}

function drawPatternEdges() {
    let w = 10

    background(bg_color)
    fill('red')
    stroke('black')
    strokeWeight(2)

    pattern.forEach(element => {
        let x = element[0]
        let y = element[1]

        if(x - w < 0) {
            x = w
        } else if(x + w > screen_size) {
            x = screen_size - w
        }

        if(y - w < 0) {
            y = w
        } else if(y + w > screen_size) {
            y = screen_size - w
        }

        ellipse(x, y, w * 2)
    })
}

function deepCopy(to_copy) {
    out = []

    to_copy.forEach(element => {
        out.push([element[0], element[1]])
    })

    return out
}

function colorToHex(col) {
    return '#' + hex(floor(red(col) * 255), 2) + hex(floor(green(col) * 255), 2) + hex(floor(blue(col) * 255), 2)
}