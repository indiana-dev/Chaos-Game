const gui = new dat.GUI({name: "Settings", width: '40'})

function initGUI() {
    presets_ctrl = gui.add(settings, 'preset', getPresetsNames())
        .onChange(on_preset_change)

    speed_ctrl = gui.add(settings, 'speed', 0, 15000)

    show_fps_ctrl = gui.add(settings, 'show_fps')
        .onChange(on_show_fps_change)

    fast_colors_ctrl = gui.add(settings, 'fast_colors')
        .onChange(on_fast_colors_change)

    alpha_ctrl = gui.add(settings, 'alpha', 0.1, 1, 0.1)
        .onChange(updateColors)

    fast_colors_attenuation_ctrl = gui.add(settings, 'fast_colors_attenuation', 10, 1000)
        .onChange(updateColors)

    showElement(alpha_ctrl, settings.fast_colors)
    showElement(fast_colors_attenuation_ctrl, !settings.fast_colors)

    auto_adjust_ctrl = gui.add(settings, 'auto_adjust')
        .name('Auto Adjust')
        .onChange(on_auto_adjust_change)

    mode_add_point_ctrl = gui.add(settings, 'mode_add_point')
        .name('click to add point')
    
    show_forbidden_zone_ctrl = gui.add(settings, 'show_forbidden_zone')
        .name('show forbidden zone')
        .onChange(on_show_forbidden_zone_change)

    showElement(show_forbidden_zone_ctrl, false)
}

function on_preset_change() {
    presets.forEach(element => {
        if(element.name == settings.preset) {
            initGame(element)
            return
        }
    });
}

function on_show_fps_change() {
    noStroke()
    fill('black')
    rect(0, 0, 80, 15)
    stroke(fg_color)
}

function on_fast_colors_change() {
    showElement(alpha_ctrl, settings.fast_colors)
    showElement(fast_colors_attenuation_ctrl, !settings.fast_colors)

    if(!settings.fast_colors) {
        fast_colors_attenuation_ctrl.setValue(fm.max_frequency)
    }

    if(settings.auto_adjust) {
        fm.draw()
    } else {
        updateColors()
    }
}

function on_auto_adjust_change() {
    if(settings.auto_adjust) {
        fm.draw()
        draw_enabled = false
    } else {
        draw_enabled = true
    }
}

function on_show_forbidden_zone_change() {
    if(!settings.show_forbidden_zone) {
        updateColors()
    }
}

function showElement(elm, show = true) {
    elm.domElement.parentElement.parentElement.style.display = (show ? 'block' : 'none')
}

function hideElement(elm) {
    elm.domElement.parentElement.parentElement.style.display = 'none'
}