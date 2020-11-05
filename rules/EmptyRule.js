let rule_distance_2 = {
    condition: 'distance',
    comparator: '!=',
    value: 2
}

let rule_no_neighbor_bug1 = {
    version: 1,
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

    else: new DistanceRule(rule_no_neighbor)
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
    condition: 'forbidden zone',
    value: {
        x: 0.5,
        y: 0.5,
        radius: 0.25
    }
}

const versions_list = ['default', 'bug1', 'bug2']
const direction_list = ['none', 'clockwise', 'anti-clockwise']
const conditions_list = ['none', 'distance', 'last 2 edges are equal', 'forbidden zone']
const patterns_list = ['triangle', 'square', 'pentagon', 'hexagon', '8-point square']

class EmptyRule {
    constructor(settings) {
        if(settings == undefined) {
            this.settings = {}
        } else {
            this.settings = settings
        }

        if(this.settings.jump_length == undefined) {
            this.settings.jump_length = 0.5
        } 

        if(this.settings.condition == undefined) {
            this.settings.condition = 'none'
        }
    }

    isEdgeValid() {
        return true
    }

    initGUI() { }
}

function getRandomJumpLength() {
    let r = random()

    if(r < 1/4) {
        return inverse_phi
    } else if (r < 1/2) {
        return 2/3
    } else {
        return 0.5
    }
}