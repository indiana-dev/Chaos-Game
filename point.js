class Point {
    constructor() {
    }

    init(pattern, rule) {
        this.pattern = patternToPoints(pattern)
        this.rule = rule

        if(this.rule == undefined) {
            this.rule = new EmptyRule()
        }

        this.rule.pattern_length = this.pattern.length

        this.last_edges = []

        this.initCoordinates()
        this.initGUI()

        ///todo
        points.push(0)
    }

    initCoordinates() {
        let random_edge = this.pattern[floor(random(this.pattern.length))]

        this.x = random_edge.x
        this.y = random_edge.y
    }

    update() {
        let random_edge = this.getValidRandomEdge()

        this.updateLastSelectedEdges(random_edge)

        this.x = lerp(this.x, random_edge.x, this.rule.settings.jump_length)
        this.y = lerp(this.y, random_edge.y, this.rule.settings.jump_length)

        this.updateFrequency()
    }

    updateLastSelectedEdges(new_edge) {
        this.last_edges[1] = this.last_edges[0]
        this.last_edges[0] = new_edge
    }

    updateFrequency() {
        let freq_x = floor(this.x * (screen_size-1))
        let freq_y = floor(this.y * (screen_size-1))

        fm.frequency[freq_x][freq_y]++

        if(fm.frequency[freq_x][freq_y] > fm.max_frequency) {
            fm.max_frequency = fm.frequency[freq_x][freq_y]
        }
    }

    draw() {
        let draw_x = floor(this.x * (screen_size-1))
        let draw_y = floor(this.y * (screen_size-1))

        if(!settings.fast_colors) {
            stroke(getInfraredColor(fm.frequency[draw_x][draw_y] / settings.fast_colors_attenuation))
        }

        point(draw_x, draw_y)
    }

    getValidRandomEdge() {
        if(this.rule.settings.condition == 'none') {
            return this.pattern[floor(random(this.pattern.length))]
        }

        let valid_edges = []

        this.pattern.forEach(edge => {
            if(this.rule.isEdgeValid(edge, this)) {
                valid_edges.push(edge)
            }
        })

        if(valid_edges.length == 0) {
            print("!!! NO VALID EDGE FOUND !!!")
        }

        return valid_edges[floor(random(valid_edges.length))]
    }

    initGUI() {  
        let button_functions = {
            random_rules: initGame,
        }

        if(this.gui != undefined) {
            gui.removeFolder(this.gui)
        }

        this.gui = gui.addFolder('Point 1 rules')
        this.gui.open()

        // this.gui.add(this.rule.settings, 'point_pattern', patterns_list)
        //     .onChange(updateColors)

        this.gui.add(this.rule.settings, 'jump_length', 0.2, 0.8, 0.01)
            .onChange(updateColors)

        this.gui.add(this.rule.settings, 'condition', conditions_list)
            .onChange(this.on_condition_change.bind(this))

        this.rule.initGUI(this.gui)

        this.gui.add(button_functions, 'random_rules')
            .name('Generate new rules')
    }

    on_condition_change() {
        switch(this.rule.settings.condition) {
            case 'none': this.rule = new EmptyRule(); break
            case 'distance': this.rule = DistanceRule.getRandom(this.pattern.length); break
            case 'last 2 edges are equal': this.rule = LastEdgesRule.getRandom(this.pattern.length); break
            case 'forbidden zone': this.rule = ForbiddenZoneRule.getRandom(this.pattern.length); break
        }

        this.rule.pattern_length = this.pattern.length

        this.initGUI()
        updateColors()
    }
}