class LastEdgesRule {
    constructor(parameters) {
        if(parameters == undefined) {
            this.settings = {}
        } else {
            this.settings = parameters
        }

        if(this.settings.jump_length == undefined) {
            this.settings.jump_length = 0.5
        }
    }

    isEdgeValid(edge, point) {
        if(point.last_edges[0] == undefined || point.last_edges[1] == undefined) {
            return true
        }

        return (point.last_edges[0].index != point.last_edges[1].index || 
                this.settings.else.isEdgeValid(edge, point))
    }

    static getRandom(pattern_length) {
        let settings = {
            condition: 'last 2 edges are equal',
            comparator: '!=',
            jump_length: getRandomJumpLength(),
            else: (random() < 0.5 ? DistanceRule.getRandom(pattern_length) : ForbiddenZoneRule.getRandom())
        }

        return new LastEdgesRule(settings)
    }

    initGUI(parent) {
        let conditions = [...conditions_list]
        conditions.splice(conditions.indexOf('last 2 edges are equal'), 1)
        conditions.splice(conditions.indexOf('none'), 1)

        this.sub_folder = parent.addFolder('Rule if condition is validated')
        this.sub_folder.open()
        this.sub_folder.add(this.settings.else.settings, 'condition', conditions)
            .onChange(this.on_condition_change.bind(this, parent))

        this.settings.else.initGUI(this.sub_folder)
    }

    on_condition_change(parent) {
        parent.removeFolder(this.sub_folder)

        switch(this.settings.else.settings.condition) {
            case 'none': this.settings.else = new EmptyRule(); break
            case 'distance': this.settings.else = DistanceRule.getRandom(this.pattern_length); break
            case 'last 2 edges are equal': this.settings.else = LastEdgesRule.getRandom(this.pattern_length); break
            case 'forbidden zone': this.settings.else = ForbiddenZoneRule.getRandom(this.pattern_length); break
        }
        
        this.initGUI(parent)
        updateColors()
    }
}