"""Native six-face drum: continuous real finger contact drives a manual turn.

Source 3527131/B; source-authored +60° X rotation about (0,64,70) mm.
Printed face5 (umbrella) enters the fixed clear window after that positive turn.
Replay travel is illustrative on the existing cap, not a validated mechanism.
"""
try:
    from scripts.concept_3d.scenes._language_timer_tools import FrictionTurn, smooth, tap, top_normal, press_parts, pointer_cycle
except ModuleNotFoundError:
    from scenes._language_timer_tools import FrictionTurn, smooth, tap, top_normal, press_parts, pointer_cycle

SPEC = {
    "slug": "picture-harbor-turning-picture-drum-concept", "duration": 28,
    "captions": [(2.3, 5.2, "Turn to a picture."), (13.8, 16.6, "Press to hear it again.")],
    "foley": [(4.2, "click"), (10.0, "click"), (15.0, "click"), (15.6, "click"), (24.0, "click")],
    "audio_cues": [{"time": 10.7, "text": "Umbrella.", "kind": "speech"},
                   {"time": 15.7, "text": "Umbrella.", "kind": "speech"},
                   {"time": 24.8, "text": "Tree.", "kind": "speech"}],
}


def build(stage):
    stage.set_camera(direction=(3.2, -4.4, 2.6), margin=1.38)
    turn = FrictionTurn(stage, "manual_turn_knob", (1, 0, 0), (0, 64, 70),
                        wrist=(.65, -.7, .4), dorsal=(1, 0, .45),
                        follow_wrist_rotation=False)
    # Keep the artificial far sleeve opening beyond the right image edge.
    # Only its last ring moves; the wrist fit and contact pose stay unchanged.
    sleeve = turn.hand.cuff
    sleeve_end = max(vertex.co.z for vertex in sleeve.data.vertices)
    for vertex in sleeve.data.vertices:
        if vertex.co.z > sleeve_end - 1e-6:
            vertex.co.z += .020
    sleeve.data.update()
    replay_normal = top_normal(stage, "replay_language_key_0")
    replay = stage.pointer("replay_language_key_0", normal=replay_normal,
                           wrist=(-1.0, -.50, .65), radius_mm=10)
    replay.show(False)

    def update(t):
        fraction = smooth(4.2, 10.0, t) * (1 - smooth(19.0, 24.0, t))
        stage.source(fraction)
        amount = tap(t, 15.0)
        press_parts(stage, ["replay_language_key_0"], amount, replay_normal)
        turning = 2.2 <= t <= 12.2 or 17.5 <= t <= 26.0
        turn.show(turning)
        if turning:
            if t < 14:
                distance = .11 * (1 - smooth(2.2, 4.0, t)) + .11 * smooth(10.7, 12.2, t)
            else:
                distance = .11 * (1 - smooth(17.5, 18.9, t)) + .11 * smooth(24.5, 26.0, t)
            turn.contact(distance)
            transform = turn.hand.root.matrix_world.copy()
            transform.translation.x += .40 * distance / .11
            turn.hand.root.matrix_world = transform
        pointer_cycle(replay, t, 13.2, 15.0, 17.1)
        if 13.2 <= t <= 17.1:
            weight = 1 - smooth(13.2, 15.0 - .32, t) + smooth(15.0 + .85, 17.1, t)
            transform = replay.root.matrix_world.copy()
            transform.translation.x -= .40 * weight
            replay.root.matrix_world = transform
    return update
