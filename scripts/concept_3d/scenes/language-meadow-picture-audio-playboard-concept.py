"""Native adult theme key and actual printed Sun/Fish zones with stored words.

Source 3527133/A: theme_language_key_0 travels 0.8 mm down. Printed picture
zones remain flat; fingertip contact illustrates the proposed under-panel input.
No recognition, LEDs, microphone, screen or pronunciation judging is added.
"""
try:
    from scripts.concept_3d.scenes._language_timer_tools import tap, pointer_cycle, smooth
except ModuleNotFoundError:
    from scenes._language_timer_tools import tap, pointer_cycle, smooth

SPEC = {
    "slug": "language-meadow-picture-audio-playboard-concept", "duration": 26,
    "captions": [(2.3, 5.0, "Choose the scene."), (9.7, 12.8, "Touch a picture.")],
    "foley": [(4.0, "click"), (4.6, "click"), (8.0, "click"), (13.0, "click"), (19.0, "click")],
    "audio_cues": [{"time": 8.4, "text": "Sun.", "kind": "speech"},
                   {"time": 13.4, "text": "Fish.", "kind": "speech"},
                   {"time": 19.4, "text": "Sun.", "kind": "speech"}],
}


def build(stage):
    stage.set_camera(direction=(2.1, -3.7, 4.0), margin=1.38)
    theme = stage.pointer("theme_language_key_0", normal=(0, 0, 1), wrist=(-1.0, .10, .50), radius_mm=7)
    sun = stage.pointer("picture_zone_0", normal=(0, 0, 1), wrist=(-1.0, .10, .50), radius_mm=12)
    fish = stage.pointer("picture_zone_3", normal=(0, 0, 1), wrist=(-1.0, .10, .50), radius_mm=12)
    def raised_icon_height(pointer, icon_name):
        normal = pointer.normal
        zone_top = max((pointer.part.matrix_world @ vertex.co).dot(normal) for vertex in pointer.part.data.vertices)
        icon = stage.objects[icon_name]
        icon_top = max((icon.matrix_world @ vertex.co).dot(normal) for vertex in icon.data.vertices)
        return max(0, icon_top - zone_top)
    # The exact native Sun/Fish ink solids rise0.24mm above their flat zone.
    # Preserve both source parts and clear their real top with the hand only.
    clearances = ((sun, raised_icon_height(sun, "original_icon_0")),
                  (fish, raised_icon_height(fish, "original_icon_3")))
    for pointer in (theme, sun, fish):
        pointer.show(False)

    def side_entry(pointer, t, enter, at, leave):
        if enter <= t <= leave:
            weight = 1 - smooth(enter, at - .32, t) + smooth(at + .85, leave, t)
            transform = pointer.root.matrix_world.copy()
            transform.translation.x -= .40 * weight
            pointer.root.matrix_world = transform

    def update(t):
        stage.source(tap(t, 4.0))
        pointer_cycle(theme, t, 2.2, 4.0, 5.9)
        side_entry(theme, t, 2.2, 4.0, 5.9)
        if t < 15:
            pointer_cycle(sun, t, 6.1, 8.0, 10.0)
            side_entry(sun, t, 6.1, 8.0, 10.0)
        else:
            pointer_cycle(sun, t, 17.0, 19.0, 21.3)
            side_entry(sun, t, 17.0, 19.0, 21.3)
        pointer_cycle(fish, t, 11.0, 13.0, 15.3)
        side_entry(fish, t, 11.0, 13.0, 15.3)
        for pointer, clearance in clearances:
            if not pointer.hand.skin.hide_render:
                transform = pointer.root.matrix_world.copy()
                transform.translation += pointer.normal * clearance
                pointer.root.matrix_world = transform
    return update
