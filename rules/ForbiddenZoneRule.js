class ForbiddenZoneRule {
    constructor(parameters) {
        if(parameters == undefined) {
            this.settings = {}
        } else {
            this.settings = parameters
        }

        if(this.settings.jump_length == undefined) {
            this.settings.jump_length = 0.5
        }

        switch(this.settings.version) {
            case undefined: this.settings.version = 'default'; break
            case 0: this.settings.version = 'bug1'; break
            case 1: this.settings.version = 'bug2'; break
        }
    }

    isEdgeValid(edge, point) {
        if(point.last_edges[0] == undefined) {
            return true
        }
        
        let new_point_x, new_point_y

        if(this.settings.version == 'default') {
            new_point_x = lerp(point.x, edge.x, this.settings.jump_length)
            new_point_y = lerp(point.y, edge.y, this.settings.jump_length)
        } else if(this.settings.version == 'bug1') {
            new_point_x = lerp(point.last_edges[0].x, edge.x, this.settings.jump_length)
            new_point_y = lerp(point.last_edges[0].y, edge.y, this.settings.jump_length)
        } else if (this.settings.version == 'bug2') {
            new_point_x = edge.x
            new_point_y = edge.y
        } else {
            throw("Not implemented !" + JSON.stringify(this.settings, '', 4))
        }

        return (dist(this.settings.value.x, this.settings.value.y, new_point_x, new_point_y) > this.settings.value.radius)
    }

    static getRandom() {
        let r = random(0.05, 0.2)
        let x = constrain(random(0, 1), r, 1 - r)
        let y = constrain(random(0, 1), r, 1 - r)
        let version

        if(random() < 2/3) {
            version = (random() < 0.5 ? 0 : 1)
        }

        let value = {
            x: x,
            y: y,
            radius: r
        }

        let settings = {
            condition: 'forbidden zone',
            version: version,
            value: value,
            jump_length: getRandomJumpLength()
        }

        return new ForbiddenZoneRule(settings)
    }

    initGUI(parent) {
        parent.add(this.settings, 'version', versions_list)
            .name('algorithm')
            .onChange(updateColors)
        parent.add(this.settings.value, 'radius', 0, 0.5, 0.001)
            .onChange(updateColors)
    }
}