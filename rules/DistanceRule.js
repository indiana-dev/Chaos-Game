class DistanceRule {
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
        
        if(this.settings.direction == undefined) {
            this.settings.direction = 'none'
        }
    }

    isEdgeValid(edge, point) {
        if(point.last_edges[0] == undefined) {
            return true
        }

        if(this.settings.version == 'default') {
            return this.isEdgeValid_v1(edge, point)
        } else {
            return this.isEdgeValid_v2(edge, point)
        }
    }

    isEdgeValid_v1(edge, point) {
        if(this.settings.direction == 'clockwise') {
            return (edge.index != (point.last_edges[0].index + 1 >= point.pattern.length ? 0 : point.last_edges[0].index + 1))
        } else if(this.settings.direction == 'anti-clockwise') {
            return (edge.index != (point.last_edges[0].index - 1 < 0 ? point.pattern.length - 1 : point.last_edges[0].index - 1))
        }

        let max_index = max(edge.index, point.last_edges[0].index)
        let min_index = min(edge.index, point.last_edges[0].index)

        let dist = min(max_index - min_index, point.pattern.length - max_index + min_index)

        switch (this.settings.comparator) {
            case '!=': return (dist != this.settings.value)
            default: throw("Not implemented !" + JSON.stringify(this.settings, '', 4))
        }
    }

    isEdgeValid_v2(edge, point) {
        let max_index = max(edge.index, point.last_edges[0].index)
        let min_index = min(edge.index, point.last_edges[0].index)
        let clockwise_dist = max_index - min_index
        let anti_clockwise_dist = point.pattern.length - max_index + min_index
        let dist = 0
    
        if(this.settings.version == 'bug1') {
            switch(this.settings.direction) {
                case 'none': dist = min(clockwise_dist, anti_clockwise_dist); break
                case 'clockwise': dist = anti_clockwise_dist; break
                case 'anti-clockwise': dist = clockwise_dist; break
                default: throw("Not implemented ! " + JSON.stringify(this.settings, '', 4))
            }
        } else if(this.settings.version == 'bug2') {
            switch(this.settings.direction) {
                case 'none': dist = min(clockwise_dist, anti_clockwise_dist); break
                case 'clockwise': return (edge.index - point.last_edges[0].index != this.settings.value)
                case 'anti-clockwise': return (point.last_edges[0].index - edge.index != this.settings.value)
                default: throw("Not implemented ! " + JSON.stringify(this.settings, '', 4))
            }
        }
    
        switch (this.settings.comparator) {
            case '!=': return (dist != this.settings.value)
            default: throw("Not implemented ! " + JSON.stringify(this.settings, '', 4))
        }
    }

    static getRandom(pattern_length) {
        let value, direction, version

        if(pattern_length == 3) {
            value = 0
        } else if(pattern_length == 4) {
            value = (random() < 0.5 ? 0 : 2)
        } else {
            value = floor(random(pattern_length / 2))
        }

        if(random() < 1/3) {
            direction = (random() < 0.5 ? 'clockwise' : 'anti-clockwise')
        }
        if(random() < 1/3) {
            version = (random() < 0.5 ? 0 : 1)
        }

        let settings = {
            condition: 'distance',
            comparator: '!=',
            value: value,
            direction: direction,
            version: version,
            jump_length: getRandomJumpLength()
        }

        return new DistanceRule(settings)
    }

    initGUI(parent) {
        parent.add(this.settings, 'version', versions_list)
            .name('algorithm')
            .onChange(updateColors)
        parent.add(this.settings, 'direction', direction_list)
            .name('direction constrain')
            .onChange(updateColors)
        parent.add(this.settings, 'value')
            .name('distance')
            .onChange(updateColors)
    }
}