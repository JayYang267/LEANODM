"""Existing stage controls drive a proposed live countdown on the native screen.

Source stage0/own symbol travel0.8mm -Z. Active-stage press-to-pause and
the same stage1 travel are faithful illustrative UI choices, not firmware proof.
Next stage is manually confirmed; no silent automatic progression or new LEDs.
"""
try:
    from scripts.concept_3d.scenes._language_timer_tools import TimerDigits, tap, press_parts, pointer_cycle, smooth
except ModuleNotFoundError:
    from scenes._language_timer_tools import TimerDigits, tap, press_parts, pointer_cycle, smooth

SPEC = {
    "slug": "routinerail-visual-routine-timer-concept", "duration": 28,
    "captions": [(3.8, 6.5, "Start this stage."), (13.5, 16.4, "Pause when needed."),
                 (19.0, 22.0, "Confirm the next stage.")],
    "foley": [(5.2, "click"), (5.8, "click"), (14.8, "click"), (15.4, "click"),
              (21.0, "click"), (21.6, "click")],
}


def build(stage):
    stage.set_camera(direction=(2.4, -4.5, 2.8), margin=1.38)
    display = TimerDigits(stage)
    current = stage.pointer("stage_key_0", normal=(0, 0, 1), wrist=(1.0, -.60, .65), radius_mm=10)
    following = stage.pointer("stage_key_1", normal=(0, 0, 1), wrist=(1.0, -.60, .65), radius_mm=10)
    def raised_symbol_height(pointer, symbol_name):
        normal = pointer.normal
        cap_top = max((pointer.part.matrix_world @ vertex.co).dot(normal) for vertex in pointer.part.data.vertices)
        symbol = stage.objects[symbol_name]
        symbol_top = max((symbol.matrix_world @ vertex.co).dot(normal) for vertex in symbol.data.vertices)
        return max(0, symbol_top - cap_top)
    # Source symbols travel with their own cap and rise0.20mm above it.
    # Hand clearance follows the measured native top; source travel stays0.8mm.
    clearances = ((current, raised_symbol_height(current, "stage_symbol_0")),
                  (following, raised_symbol_height(following, "stage_symbol_1")))
    current.show(False)
    following.show(False)

    def side_entry(pointer, t, enter, at, leave):
        if enter <= t <= leave:
            weight = 1 - smooth(enter, at - .32, t) + smooth(at + .85, leave, t)
            transform = pointer.root.matrix_world.copy()
            transform.translation.x += .40 * weight
            pointer.root.matrix_world = transform

    def update(t):
        stage.source(max(tap(t, 5.2), tap(t, 14.8)))
        press_parts(stage, ["stage_key_1", "stage_symbol_1"], tap(t, 21.0))
        if t < 11:
            pointer_cycle(current, t, 3.0, 5.2, 7.3)
            side_entry(current, t, 3.0, 5.2, 7.3)
        else:
            pointer_cycle(current, t, 12.6, 14.8, 17.0)
            side_entry(current, t, 12.6, 14.8, 17.0)
        pointer_cycle(following, t, 18.8, 21.0, 23.2)
        side_entry(following, t, 18.8, 21.0, 23.2)
        for pointer, clearance in clearances:
            if not pointer.hand.skin.hide_render:
                transform = pointer.root.matrix_world.copy()
                transform.translation += pointer.normal * clearance
                pointer.root.matrix_world = transform
        if t < 5.2:
            seconds = 15 * 60
        elif t < 14.8:
            seconds = 15 * 60 - int(t - 5.2)
        elif t < 21.0:
            seconds = 15 * 60 - int(14.8 - 5.2)
        else:
            seconds = 10 * 60 - int(t - 21.0)
        display.set(seconds)
    return update
