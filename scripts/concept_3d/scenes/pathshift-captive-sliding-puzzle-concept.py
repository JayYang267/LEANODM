"""An actual finger push along the source-authored first legal captive move."""
from mathutils import Vector
try:
    from concept_3d.scenes._capture_puzzle import ramp, pointer_pose, camera, mix
except ModuleNotFoundError:
    from scripts.concept_3d.scenes._capture_puzzle import ramp, pointer_pose, camera, mix

SPEC = {
    'slug': 'pathshift-captive-sliding-puzzle-concept',
    'duration': 26,
    'captions': [
        (0, 4, 'A captive sliding puzzle concept.'),
        (4, 12, 'Push one retained piece along its track.'),
        (12, 19, 'Compare the layout with the target.'),
        (19, 26, 'Slide back to reset.'),
    ],
    'foley': [(6.0, 'click'), (20.0, 'click')],
}


def build(stage):
    # The source pose moves only retained_piece_5 by (0,-32,0) mm. A fingertip
    # pushes its upper surface; this scene does not invent a solution or grip.
    finger = stage.pointer('retained_piece_5', normal=(0, 0, 1),
                           wrist=(-1, -.5, .8), radius_mm=9)
    finger.show(False)

    def update(t):
        forward = ramp(t, 6, 11)
        backward = ramp(t, 20, 23)
        stage.source(forward * (1 - backward))
        first = 3.8 <= t < 15.8
        second = 17.8 <= t < 24.5
        if first:
            clearance = .065 * (1 - ramp(t, 3.8, 5.8)) + .065 * ramp(t, 14, 15.8)
        elif second:
            clearance = .065 * (1 - ramp(t, 17.8, 19.8)) + .065 * ramp(t, 23.2, 24.5)
        else:
            clearance = .065
        pointer_pose(finger, first or second, clearance)
        overhead = ramp(t, 11.5, 16) * (1 - ramp(t, 18, 20))
        camera(stage, mix((3.2, -4, 4.3), (1.7, -2.2, 6.5), overhead), margin=1.4)
        if first or second:
            # Preserve the original vertical clearance and every contact pose.
            # Approach/withdrawal also travel along the camera's left side so
            # visibility toggles occur entirely outside the image, not midair.
            side_fraction=clearance/.065
            matrix=finger.root.matrix_world.copy()
            matrix.translation+=Vector((-.4,-.3,0))*side_fraction
            finger.root.matrix_world=matrix

    return update
