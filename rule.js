let rule_distance_2 = {
    condition: 'distance',
    comparator: '!=',
    value: 2
}

let rule_no_neighbor_bug1 = {
    bug: 1,
    comparator: "!=",
    condition: "distance",
    value: 1
}

let rule_no_neighbor = {
    condition: 'distance',
    comparator: '!=',
    value: 1
}

let rule_last_edges = {
    condition: 'last 2 edges',
    comparator: '!=',
    value: 2,

    else: rule_no_neighbor
}

let rule_not_same = {
    condition: 'distance',
    comparator: '!=',
    value: 0
}

let rule_distance_1_anticlk = {
    condition: 'distance',
    comparator: '!=',
    value: 1,
    direction: 'anti-clockwise'
}

let rule_forbidden = {
    condition: 'forbidden_zone',
    value: {
        x: 0.5,
        y: 0.5,
        radius: 0.25
    }
}

class Rule {
    constructor(parameters) {
        if(parameters == undefined) {
            return
        }

        this.condition = parameters.condition
        this.comparator = parameters.comparator
        this.value = parameters.value
        this.direction = parameters.direction
        this.else = parameters.else
        this.bug = parameters.bug
    }

    getValidEdges(point) {
        let valid_edges = []
    
        if(point.last_edges[0] == undefined) {
            return point.pattern
        }
                
        for(let i = 0; i < point.pattern.length; i++) {        
            if(this.condition == 'distance') {
                if(this.bug == undefined) {
                    if(this.checkDistanceRule(point, point.pattern[i], this)) {
                        valid_edges.push(point.pattern[i])
                    } 
                } else {
                    if(_checkDistanceRule_BUG(point, point.pattern[i], this, this.bug)) {
                        valid_edges.push(point.pattern[i])
                    }
                }
            } else if (this.condition == 'forbidden_zone') {
                if(this.checkForbiddenZoneRule(point, point.pattern[i], this)) {
                    valid_edges.push(point.pattern[i])
                }
            } else if(this.condition == 'last 2 edges') {
                if(point.last_edges[1] == undefined) {
                    return point.pattern
                }

                if(this.checkLast2EdgesRule(point, point.pattern[i], this)) {
                    valid_edges.push(point.pattern[i])
                }
            }
        }
    
        return valid_edges
    }

    checkDistanceRule(point, element, rule) {        
        if(rule.direction != undefined) {
            if(rule.direction == 'clockwise') {
                return (element.index != (point.last_edges[0].index + 1 >= point.pattern.length ? 0 : point.last_edges[0].index + 1))
            } else {
                return (element.index != (point.last_edges[0].index - 1 < 0 ? point.pattern.length - 1 : point.last_edges[0].index - 1))
            }
        }

        let max_index = max(element.index, point.last_edges[0].index)
        let min_index = min(element.index, point.last_edges[0].index)

        let dist = min(max_index - min_index, point.pattern.length - max_index + min_index)

        switch (rule.comparator) {
            case '!=': return (dist != rule.value)
            default: throw("Not implemented !" + JSON.stringify(rule, '', 4))
        }
    }

    checkLast2EdgesRule(point, element, rule) {
        switch (rule.comparator) {
            case '!=': return (point.last_edges[0].index != point.last_edges[1].index || 
                               this.checkDistanceRule(point, element, rule.else))
            default: throw("Not implemented !" + JSON.stringify(rule, '', 4))
        }
    }

    checkForbiddenZoneRule(point, element, rule) {
        let new_point_x, new_point_y

        if(rule.bug == undefined) {
            new_point_x = lerp(point.x, element.x, point.jump_length)
            new_point_y = lerp(point.y, element.y, point.jump_length)
        } else if(rule.bug == 0) {
            new_point_x = lerp(point.last_edges[0].x, element.x, point.jump_length)
            new_point_y = lerp(point.last_edges[0].y, element.y, point.jump_length)
        } else {
            new_point_x = element.x
            new_point_y = element.y
        }

        return (dist(rule.value.x, rule.value.y, new_point_x, new_point_y) > rule.value.radius)
    }

    static getRandomRule(pattern_length, force_condition) {
        let conditions = ['distance', 'last 2 edges', 'forbidden_zone']
        let comparators = ['!=']
        let condition = force_condition

        if(force_condition == undefined) {
            condition = getRandomElementFromArray(conditions)
        }

        let rule = new Rule()
        rule.condition = condition

        switch(condition) {
            case 'distance':
                rule.comparator = getRandomElementFromArray(comparators)

                if(pattern_length == 3) {
                    rule.value = 0
                } else if(pattern_length == 4) {
                    rule.value = (random() < 0.5 ? 0 : 2)
                } else {
                    rule.value = floor(random(pattern_length / 2))
                }

                if(random() < 1/3) {
                    rule.direction = (random() < 0.5 ? 'clockwise' : 'anti-clockwise')
                }
                if(random() < 1/3) {
                    rule.bug = (random() < 0.5 ? 0 : 1)
                }
            break
            case 'last 2 edges':
                rule.comparator = '!='
                rule.value = floor(random(pattern_length / 2))
                rule.else = this.getRandomRule(pattern_length, 'distance')
            break
            case 'forbidden_zone':
                let r = random(0.05, 0.2)
                let x = constrain(random(0, 1), r, 1 - r)
                let y = constrain(random(0, 1), r, 1 - r)

                if(random() < 2/3) {
                    rule.bug = (random() < 0.5 ? 0 : 1)
                }

                rule.value = {
                    x: x,
                    y: y,
                    radius: r
                }
            break
        }

        return rule
    }
}

// pattern = [[0,0], [0,1], [1,1], [1,0]]
// let rule_4 = {
//     condition: 'distance',
//     comparator: '!=',
//     value: 1,
//     direction: 'anti-clockwise'
// }

function _checkDistanceRule_BUG(point, element, rule, bug) {
    let max_index = max(element.index, point.last_edges[0].index)
    let min_index = min(element.index, point.last_edges[0].index)
    let clockwise_dist = max_index - min_index
    let anti_clockwise_dist = point.pattern.length - max_index + min_index
    let dist = 0

    if(bug == 0) {
        if(rule.direction != undefined) {
            if(rule.direction != 'clockwise') {
                dist = clockwise_dist
            } else {
                dist = anti_clockwise_dist
            }
        } else {
            dist = min(clockwise_dist, anti_clockwise_dist)
        }
    } else {
        if(rule.direction != undefined) {
            if(rule.direction == 'clockwise') {
                return (element.index - point.last_edges[0].index != rule.value)
            } else {
                return (point.last_edges[0].index - element.index != rule.value)
            }
        } else {
            dist = min(clockwise_dist, anti_clockwise_dist)
        }
    }

    switch (rule.comparator) {
        case '!=': return (dist != rule.value)
        default: throw("Not implemented ! " + JSON.stringify(rule, '', 4))
    }
}