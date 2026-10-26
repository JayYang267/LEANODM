"""Native C/at cards seat in their original slots, then L/R/+ play stored parts.

The source authorizes 20 mm card withdrawal. Reversing it seats each card.
Finger friction acts on the upper card face; no unsupported generic pinch grip.
Existing playback caps use illustrative 0.8 mm press travel, with own legends.
"""
try:
    from scripts.concept_3d.scenes._language_timer_tools import smooth, tap, press_parts, pointer_cycle, native_points
except ModuleNotFoundError:
    from scenes._language_timer_tools import smooth, tap, press_parts, pointer_cycle, native_points

SPEC = {
    "slug": "sound-steps-two-card-sound-pairing-concept", "duration": 28,
    "captions": [(3.0, 6.0, "Seat the two parts."),
                 (17.8, 18.9, "C sound: /k/."), (20.8, 21.4, "at"),
                 (21.5, 23.6, "Hear them together."), (23.9, 25.5, "cat")],
    "foley": [(8.0, "click"), (15.0, "click"), (17.2, "click"), (20.2, "click"), (23.3, "click")],
    "audio_cues": [{"time": 17.8, "text": "C.", "kind": "speech"},
                   {"time": 20.8, "text": "at.", "kind": "speech"},
                   {"time": 23.9, "text": "Cat.", "kind": "speech"}],
}


def build(stage):
    from mathutils import Vector
    stage.set_camera(direction=(2.6, -4.3, 3.0), margin=1.46)
    groups = [["original_card_0", "card_letter_0_0", "original_code_0_4", "original_code_0_5"],
              ["original_card_1", "card_letter_1_0", "card_letter_1_1", "original_code_1_0", "original_code_1_4"]]
    seating = []
    for index in range(2):
        points = native_points(stage, f"original_card_{index}")
        center = ((min(p.x for p in points) + max(p.x for p in points)) * 500,
                  min(p.y for p in points) * 1000,
                  max(p.z for p in points) * 1000 - 13)
        pointer = stage.pointer(f"original_card_{index}", normal=(0, -1, 0),
                                wrist=(-1.0 if index == 0 else 1.0, -.10, .55),
                                radius_mm=10, center_mm=center)
        pointer.show(False)
        seating.append(pointer)
    playback = [stage.pointer(f"play_key_{index}", normal=(0, 0, 1),
                               wrist=((-1.0, .10, .40), (-1.0, -.30, .50), (1.0, .10, .40))[index],
                               radius_mm=10) for index in range(3)]
    for pointer in playback:
        pointer.show(False)

    def update(t):
        stage.source(0)
        stage.source(1 - smooth(5, 8, t), parts=groups[0])
        stage.source(1 - smooth(12, 15, t), parts=groups[1])
        for pointer, enter, start, finish, leave in [(seating[0], 2.7, 5, 8, 9.6),
                                                    (seating[1], 9.8, 12, 15, 16.4)]:
            pointer.show(enter <= t <= leave)
            if enter <= t <= leave:
                pointer.contact()
                distance = .10 * (1 - smooth(enter, start - .2, t)) + .10 * smooth(finish + .1, leave, t)
                if distance:
                    pointer.approach(distance)
                transform = pointer.root.matrix_world.copy()
                transform.translation.x += (-1 if pointer is seating[0] else 1) * .40 * distance / .10
                pointer.root.matrix_world = transform
        for index, at in [(0, 17.2), (2, 20.2), (1, 23.3)]:
            amount = tap(t, at)
            press_parts(stage, [f"play_key_{index}", f"play_graphic_{index}"], amount)
            pointer_cycle(playback[index], t, at - 1.0, at, at + 1.4)
            if at - 1.0 <= t <= at + 1.4:
                weight = 1 - smooth(at - 1.0, at - .32, t) + smooth(at + .85, at + 1.4, t)
                transform = playback[index].root.matrix_world.copy()
                transform.translation.x += (1 if index == 2 else -1) * .40 * weight
                playback[index].root.matrix_world = transform
            if index in (1, 2) and at - 1.0 <= t <= at + 1.4:
                # Native +/R ink solids rise0.23mm above their cap. The cap
                # and its own graphic keep the same0.8mm source press travel;
                # only the hand clears the actual raised source geometry.
                transform = playback[index].root.matrix_world.copy()
                transform.translation += Vector((0, 0, .00023))
                playback[index].root.matrix_world = transform
    return update
