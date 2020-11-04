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
    }

    initCoordinates() {
        let random_edge = this.pattern[floor(random(this.pattern.length))]

        this.x = random_edge.x
        this.y = random_edge.y
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

        fm.frequency[freq_x][freq_y]++

        if(fm.frequency[freq_x][freq_y] > fm.max_freqency) {
            fm.max_freqency = fm.frequency[freq_x][freq_y]
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