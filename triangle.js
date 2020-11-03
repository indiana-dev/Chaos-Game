let settings = {
    preset: 'Triangle',
    speed: 10000,
    alpha: 0.4,
    fast_colors: true,
    fast_colors_attenuation: 40,
    show_fps: true,
    mode_add_point: false,
    show_forbidden_zone: true
}

let enable_zoom = false

class Camera {
    constructor() {
        this.init()
    }

    init() {
        this.x = 0.5
        this.y = 0.5
        this.size = 1

        this.update()
    }

    update() {
        this.half_size = this.size / 2

        this.max_x = this.x + this.half_size
        this.min_x = this.x - this.half_size

        this.max_y = this.y + this.half_size
        this.min_y = this.y - this.half_size
    }
}

let cam = new Camera()
let presets = []

let bg_color, fg_color

p5.disableFriendlyErrors = true;

class Preset {
    constructor(name, pattern, rule, step = 1/2) {
        this.name = name
        this.pattern = pattern
        this.step = step

        if(rule != undefined && !(rule instanceof(Rule))) {
            this.rule = new Rule(rule)
        } else {
            this.rule = rule
        }
    }
}

function initPresets() {
    presets.push(new Preset('Triangle', pattern_triangle_1))
    presets.push(new Preset('Triangle 2', pattern_triangle_2(2/3)))
    presets.push(new Preset('Pentagon', pattern_pentagon()))
    presets.push(new Preset('Pentagon 2', pattern_pentagon(), rule_not_same))
    presets.push(new Preset('Pentagon 3', pattern_pentagon(), rule_last_edges))
    presets.push(new Preset('Pentagon 4', pattern_pentagon(), undefined, inverse_phi))
    presets.push(new Preset('Hexagon', pattern_hexagon()))
    presets.push(new Preset('Hexagon 2', pattern_hexagon(), rule_no_neighbor_bug1))
    presets.push(new Preset('Square', pattern_square_1, rule_not_same))
    presets.push(new Preset('Square 2', pattern_square_2, rule_distance_1_anticlk))
    presets.push(new Preset('Square 3', pattern_square_2, rule_distance_2))
    presets.push(new Preset('Square 4', pattern_square_2, rule_last_edges))
    presets.push(new Preset('Square 5', pattern_square_3, undefined, 2/3))
    presets.push(new Preset('Square 6', pattern_square_1, rule_forbidden))
    presets.push(new Preset('Filled Square', pattern_square_3))
    presets.push(new Preset('Sponge', pattern_fractal_square, undefined, 2/3))
}

function getPresetsNames() {
    let presets_names = []

    presets.forEach(element => {
        presets_names.push(element.name)
    })

    return presets_names
}

function initGame(preset) {
    if(preset == undefined) {
        let pattern = getRandomPattern()
        let rule = Rule.getRandomRule(pattern.length)
        let step = getRandomStep()

        pt = new Point(pattern, rule, step)
    } else {
        pt = new Point(preset.pattern, preset.rule, preset.step)
    }

    print(pt.pattern)
    print(pt.rule)
    print(pt.jump_length)

    if(pt.rule && pt.rule.condition == 'forbidden_zone') {
        showElement(show_forbidden_zone_ctrl)
    } else {
        hideElement(show_forbidden_zone_ctrl)
    }

    randomizeColors()
    updateColors()
    cam.init()
}

function getRandomStep() {
    let r = random()

    if(r < 1/4) {
        return inverse_phi
    } else if (r < 1/2) {
        return 2/3
    } else {
        return 0.5
    }
}

function setup() {
    screen_size = getScreenSize()
    createCanvas(screen_size, screen_size)
    colorMode(RGB, 1)

    infrared_colors = [color('black'), color('#20008c'), color('#c07'), color('gold'), color('white')]
    //infrared_colors = [color('#a8e6cf'), color('#dcedc1'), color('#ffd3b6'), color('#ffaaa5'), color('#ff8b94')]
    
    randomizeColors()

    initPresets()
    initGUI()
    initGame(presets[0])
}

let fps = 0

function draw() {
    for(let i = 0; i < settings.speed; i++) {
        pt.update()
        pt.draw()
    }

    if(settings.show_forbidden_zone && pt.rule && pt.rule.condition == 'forbidden_zone') {
        showForbiddenZone()
    }

    if(settings.show_fps) {
        showFPS()
    }
}

function showForbiddenZone() {
    noFill()
    ellipse(pt.rule.value.x * screen_size, pt.rule.value.y * screen_size, pt.rule.value.radius * 2 * screen_size, pt.rule.value.radius * 2 * screen_size)
}

function showFPS() {
    noStroke()
    fill('white')
    rect(0, 0, 80, 15)
    fill('black')
    text("FPS: " + fps.toFixed(2), 10, 10)

    if(frameCount%10==0) { 
        fps = frameRate()
    }
    stroke(fg_color)
}

function mouseClicked() {
    if(mouseX < 0 || mouseX > screen_size || 
        mouseY < 0 || mouseY > screen_size) {
        
        return
    }

    if(!enable_zoom) {
        if(settings.mode_add_point) {
            pt.pattern.push({x:mouseX/screen_size, y:mouseY/screen_size,index:pt.pattern.length})
            background(bg_color)
        }
        return
    } 

    cam.x = map(mouseX, 0, screen_size, cam.min_x, cam.max_x)
    cam.y = map(mouseY, 0, screen_size, cam.min_y, cam.max_y)
    cam.size *= 0.9
    cam.update()

    background(0)
}

function mouseDragged() {
    if(!pt.rule || pt.rule.condition != 'forbidden_zone' || 
        mouseX < 0 || mouseX > screen_size || 
        mouseY < 0 || mouseY > screen_size){

        return
    }

    fg_color.setAlpha(max(0.5, settings.alpha))
    stroke(fg_color)

    pt.rule.value = {
        x: mouseX / screen_size,
        y: mouseY / screen_size,
        radius: pt.rule.value.radius
    }

    background(bg_color)
}

function mouseReleased() {
    if(!pt.rule || pt.rule.condition != 'forbidden_zone') {
        return
    }

    if(alpha(fg_color) != settings.alpha) {
        fg_color.setAlpha(settings.alpha)
        updateColors()
    }
}

function randomizeColors() {
    bg_color = color(random(), random(), random())
    bg_color = color('black')
    fg_color = color(random(), random(), random())

    fill(255)
}

function updateColors() {
    fg_color.setAlpha(settings.alpha)
    background(bg_color)
    stroke(fg_color)
}