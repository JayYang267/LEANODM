"""Native30°side-dial turn with a changing monochrome interval and real pause.

The source supplies dial rotation only. Pressing that existing rotary control
to start is an illustrative encoder action; the separate native pause key
retains its own geometry. Neither action claims validated timer firmware.
"""
from mathutils import Vector

try:
    from scripts.concept_3d.scenes._language_timer_tools import TimerDigits, FrictionTurn, smooth, tap, top_normal, press_parts, pointer_cycle
except ModuleNotFoundError:
    from scenes._language_timer_tools import TimerDigits, FrictionTurn, smooth, tap, top_normal, press_parts, pointer_cycle

SPEC = {
    "slug": "timepebble-visual-interval-timer-concept", "duration": 28,
    "captions": [(2.0, 5.0, "Turn to set the time."), (16.0, 19.0, "Pause the countdown.")],
    "foley": [(4.8, "click"), (8.2, "click"), (11.0, "click"), (11.6, "click"),
              (18.0, "click"), (18.6, "click"), (23.0, "click")],
}


def build(stage):
    stage.set_camera(direction=(2.5, -4.6, 2.7), margin=1.42)
    display = TimerDigits(stage)
    turn = FrictionTurn(stage, "side_dial", (0, -1, 0), (43, 13, 52),
                        wrist=(1.0, .10, .40), dorsal=(0, -.8, .6),
                        follow_wrist_rotation=False)
    dial_normal = (0, -1, 0)
    dial_press = stage.pointer("side_dial", normal=dial_normal, wrist=(1.0, -.60, .80), radius_mm=8)
    pause_normal = top_normal(stage, "pause_key", (0, -1, .7))
    pause = stage.pointer("pause_key", normal=pause_normal, wrist=(-1.0, -.60, .80), radius_mm=7)
    dial_press.show(False)
    pause.show(False)

    def side_entry(pointer, t, enter, at, leave, side):
        if enter <= t <= leave:
            weight = 1 - smooth(enter, at - .32, t) + smooth(at + .85, leave, t)
            transform = pointer.root.matrix_world.copy()
            transform.translation.x += side * .40 * weight
            pointer.root.matrix_world = transform

    def update(t):
        fraction = smooth(4.5, 8.2, t)
        stage.source(fraction)
        # Preserve the source dial rotation, add only the proposed push stroke.
        obj = stage.asset.objects["side_dial"]
        transform = obj.matrix_world.copy()
        world_normal = stage.asset.root.matrix_world.to_3x3() @ Vector(dial_normal)
        transform.translation -= world_normal * (.0006 * tap(t, 11.0))
        obj.matrix_world = transform
        press_parts(stage, ["pause_key"], max(tap(t, 18.0), tap(t, 23.0)), pause_normal)
        turn.show(2.1 <= t <= 9.5)
        if 2.1 <= t <= 9.5:
            distance = .11 * (1 - smooth(2.1, 4.3, t)) + .11 * smooth(8.4, 9.5, t)
            turn.contact(distance)
            transform = turn.hand.root.matrix_world.copy()
            transform.translation.x += .40 * distance / .11
            turn.hand.root.matrix_world = transform
        pointer_cycle(dial_press, t, 9.6, 11.0, 13.0)
        side_entry(dial_press, t, 9.6, 11.0, 13.0, 1)
        if t < 21:
            pointer_cycle(pause, t, 15.8, 18.0, 20.1)
            side_entry(pause, t, 15.8, 18.0, 20.1, -1)
        else:
            pointer_cycle(pause, t, 21.1, 23.0, 25.2)
            side_entry(pause, t, 21.1, 23.0, 25.2, -1)
        interval = 25 * 60 if t < 6.1 else 26 * 60
        if t < 11:
            seconds = interval
        elif t < 18:
            seconds = interval - int(t - 11)
        elif t < 23:
            seconds = interval - 7
        else:
            seconds = interval - 7 - int(t - 23)
        display.set(seconds)
    return update
