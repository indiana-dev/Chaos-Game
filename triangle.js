let settings = {
    preset: 'Triangle',
    speed: 10000,
    alpha: 0.4,
    fast_colors: true,
    fast_colors_attenuation: 40,
    show_fps: true,
    mode_add_point: false,
    show_forbidden_zone: true,
    auto_adjust: false
}

let points = []
let presets = []
let bg_color, fg_color
let draw_enabled = true

p5.disableFriendlyErrors = true;

class FrequencyManager {
    constructor() {
        this.init()
    }

    init() {
        this.frequency = []
        this.max_frequency = 0

        for(let i = 0 ; i < screen_size; i++) {
            this.frequency[i] = []
    
            for(let j = 0; j < screen_size; j++) {
                this.frequency[i][j] = 0
            }
        }
    }

    draw() {
        fast_colors_attenuation_ctrl.setValue(this.max_frequency)

        for(let y = 0; y < screen_size; y++) {
            for(let x = 0; x < screen_size; x++) {
                let frequency = this.frequency[x][y]

                if(frequency == 0) {
                    continue
                }
                
                if(settings.fast_colors) {
                    fg_color.setAlpha(frequency / this.max_frequency)
                    stroke(fg_color)
                }
                else {
                    stroke(getInfraredColor(frequency / this.max_frequency))
                }
                
                point(x, y)
            }
        }
        if(settings.fast_colors) {
            fg_color.setAlpha(settings.alpha)
            stroke(fg_color)
        }
    }
}

class Preset {
    constructor(name, pattern, rule, step = 1/2) {
        this.name = name
        this.pattern = pattern
        this.step = step

        if(rule == undefined) {
            this.rule = new EmptyRule()
        } else {
            this.rule = rule
        }
    }
}

function initPresets() {
    presets.push(new Preset('Triangle', pattern_triangle_1))
    presets.push(new Preset('Triangle 2', pattern_triangle_2(2/3)))
    presets.push(new Preset('Pentagon', pattern_pentagon()))
    presets.push(new Preset('Pentagon 2', pattern_pentagon(), new DistanceRule(rule_not_same)))
    presets.push(new Preset('Pentagon 3', pattern_pentagon(), new DistanceRule(rule_last_edges)))
    presets.push(new Preset('Pentagon 4', pattern_pentagon(), new EmptyRule({jump_length: inverse_phi})))
    presets.push(new Preset('Hexagon', pattern_hexagon()))
    presets.push(new Preset('Hexagon 2', pattern_hexagon(), new DistanceRule(rule_no_neighbor_bug1)))
    presets.push(new Preset('Square', pattern_square_1, new DistanceRule(rule_not_same)))
    presets.push(new Preset('Square 2', pattern_square_2, new DistanceRule(rule_distance_1_anticlk)))
    presets.push(new Preset('Square 3', pattern_square_2, new DistanceRule(rule_distance_2)))
    presets.push(new Preset('Square 4', pattern_square_2, new LastEdgesRule(rule_last_edges)))
    presets.push(new Preset('Square 5', pattern_square_3, undefined, 2/3))
    presets.push(new Preset('Square 6', pattern_square_1, new ForbiddenZoneRule(rule_forbidden)))
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
        //let rule = Rule.getRandomRule(pattern.length)
        let rule = LastEdgesRule.getRandom(pattern.length)
        pt.init(pattern, rule)
    } else {
        pt.init(preset.pattern, preset.rule)
    }

    print(pt.pattern)
    print(pt.rule)

    if(pt.rule && pt.rule.condition == 'forbidden zone') {
        showElement(show_forbidden_zone_ctrl)
    } else {
        hideElement(show_forbidden_zone_ctrl)
    }
    
    fast_colors_attenuation_ctrl.setValue(40)
    fm.init()
    randomizeColors()
    updateColors()
}

function setup() {
    screen_size = getScreenSize()
    createCanvas(screen_size, screen_size)
    colorMode(RGB, 1)

    initPresets()
    initGUI()

    pt = new Point()
    fm = new FrequencyManager()

    infrared_colors = [color('black'), color('#20008c'), color('#c07'), color('gold'), color('white')]
    //infrared_colors = [color('#a8e6cf'), color('#dcedc1'), color('#ffd3b6'), color('#ffaaa5'), color('#ff8b94')]
    
    randomizeColors()

    initGame(presets[0])
}

let fps = 0

function draw() {
    for(let i = 0; i < settings.speed; i++) {
        pt.update()

        if(draw_enabled) {
            pt.draw()
        }
    }

    if(settings.show_forbidden_zone && pt.rule && pt.rule.condition == 'forbidden zone') {
        showForbiddenZone()
    }

    if(settings.show_fps) {
        showFPS()
    }
}

function showForbiddenZone() {
    stroke(1)
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

    if(settings.mode_add_point) {
        pt.pattern.push({x:mouseX/screen_size, y:mouseY/screen_size,index:pt.pattern.length})
        background(bg_color)
    }
}

function mouseDragged() {
    if(!pt.rule || pt.rule.condition != 'forbidden zone' || 
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

    updateColors()
    fm.init()
}

function mouseReleased() {
    if(!pt.rule || pt.rule.condition != 'forbidden zone') {
        return
    }

    if(alpha(fg_color) != settings.alpha) {
        fg_color.setAlpha(settings.alpha)
        updateColors()
    }
}

function randomizeColors() {
    bg_color = color('black')
    fg_color = getRandomSaturatedColor()
}

function updateColors() {
    fg_color.setAlpha(settings.alpha)
    background(bg_color)
    stroke(fg_color)

    draw_enabled = true
    auto_adjust_ctrl.setValue(false)
}