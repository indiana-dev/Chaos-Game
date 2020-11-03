class Point {
    constructor(pattern, rule, jump_length) {
        this.pattern = patternToPoints(pattern)
        this.jump_length = jump_length

        this.rule = rule

        if(this.rule != undefined) {
            this.rule.pattern = this
        }

        this.last_edges = []

        this.initCoordinates()
        this.initFrequency()
    }

    initCoordinates() {
        let random_edge = this.pattern[floor(random(this.pattern.length))]

        this.x = random_edge.x
        this.y = random_edge.y
    }

    initFrequency() {
        this.frequency = []
        this.max_freqency = 0

        for(let i = 0 ; i < screen_size; i++) {
            this.frequency[i] = []
    
            for(let j = 0; j < screen_size; j++) {
                this.frequency[i][j] = 0
            }
        }
    }

    update() {
        let random_edge = this.getValidRandomEdge()

        this.updateLastSelectedEdges(random_edge)

        this.x = lerp(this.x, random_edge.x, this.jump_length)
        this.y = lerp(this.y, random_edge.y, this.jump_length)

        this.updateFrequency()
    }

    updateLastSelectedEdges(new_edge) {
        this.last_edges[1] = this.last_edges[0]
        this.last_edges[0] = new_edge
    }

    updateFrequency() {
        let freq_x = floor(this.x * (screen_size-1))
        let freq_y = floor(this.y * (screen_size-1))

        this.frequency[freq_x][freq_y]++

        if(this.frequency[freq_x][freq_y] > this.max_freqency) {
            this.max_freqency = this.frequency[freq_x][freq_y]
        }
    }

    draw() {
        let new_x = map(this.x, cam.x - cam.size / 2, cam.x + cam.size / 2, 0, 1)
        let new_y = map(this.y, cam.y - cam.size / 2, cam.y + cam.size / 2, 0, 1)

        if(new_x < 0 || new_x > 1 || new_y < 0 || new_y > 1) {
            return
        }

        new_x = floor(new_x * (screen_size - 1))
        new_y = floor(new_y * (screen_size - 1))

        if(!settings.fast_colors) {
            stroke(getInfraredColor(this.frequency[new_x][new_y] / settings.fast_colors_attenuation))
        }

        point(new_x, new_y)
    }

    fast_draw() {
        let draw_x = floor(this.x * (screen_size-1))
        let draw_y = floor(this.y * (screen_size-1))

        if(!settings.fast_colors) {
            stroke(getInfraredColor(this.frequency[new_x][new_y] / settings.fast_colors_attenuation))
        }

        point(draw_x, draw_y)
    }

    getValidRandomEdge() {
        if(this.rule == null) {
            return this.pattern[floor(random(this.pattern.length))]
        }

        let valid_edges = this.rule.getValidEdges(this)

        if(valid_edges.length == 0) {
            print("!!! NO VALID EDGE FOUND !!!")
        }

        return valid_edges[floor(random(valid_edges.length))]
    }
}