"""Printed search card, manual finger route, and the native manual timer key."""
try:
    from concept_3d.scenes._capture_puzzle import ramp,press,pointer_pose,camera,mix,ElapsedDigits
except ModuleNotFoundError:
    from scripts.concept_3d.scenes._capture_puzzle import ramp,press,pointer_pose,camera,mix,ElapsedDigits

SPEC = {
    'slug':'grid-grove','duration':26,
    'captions':[(0,5,'Use an original printed search card.'),
                (5,9,'Start the timer.'),
                (9,20,'Point in order. A partner observes.'),
                (20,26,'Stop the timer manually.')],
    'foley':[(7.0,'click'),(20.8,'click')],
}


def build(stage):
    key = stage.pointer('3538996_B_K1_keycap',normal=(0,0,1),wrist=(.3,-1,.4),radius_mm=8)
    card = stage.pointer('3538996_B_one_printed_card',normal=(0,0,1),wrist=(-1,-.5,.8),
                         radius_mm=6,center_mm=(-58,113,36.835))
    # The pointing forearm enters from the side instead of looking down an
    # open sleeve tube across the printed card. Distal cloth continues off-shot.
    for pointer in (key,card):
        sleeve = pointer.hand.cuff
        far = max(vertex.co.z for vertex in sleeve.data.vertices)
        for vertex in sleeve.data.vertices:
            if abs(vertex.co.z-far)<1e-7:
                vertex.co.z += .12
        sleeve.data.update()
        sleeve['scene_forearm_extension_m'] = .12
    key.show(False)
    card.show(False)
    # Only the already-proposed reflective LCD changes. The printed card never
    # lights, moves, senses touch, detects targets, or automatically scores.
    stage.objects['3538996_B_LCD_segments'].hide_render = True
    stage.objects['3538996_B_LCD_segments'].hide_set(True)
    digits = ElapsedDigits(stage,(0,205,35.88))

    def update(t):
        stage.source(press(t,6.5,7.0,7.3,7.9)+press(t,20.4,20.8,21.1,21.7))
        early = 4.5<=t<8.7
        late = 19.6<=t<23.3
        clearance = (.07*(1-ramp(t,4.5,6.4))+.07*ramp(t,7.9,8.7)) if early else \
                    (.07*(1-ramp(t,19.6,20.35))+.07*ramp(t,21.7,23.3))
        pointer_pose(key,early or late,clearance,
                     offset=(-.4*clearance/.07,-.3*clearance/.07,0))
        # Follow the actual printed 1, 2 and 3; the original card stays passive.
        route = mix(mix((-58,113,36.835),(30,173,36.835),ramp(t,11,13)),
                    (60.175,83,36.835),ramp(t,14.5,16.5))
        hover = .055*(1-ramp(t,8.8,10))+.055*ramp(t,18.2,19.5)
        pointer_pose(card,8.8<=t<19.5,hover,
                     offset=((route[0]+58)*.001-.4*hover/.055,
                             (route[1]-113)*.001-.3*hover/.055,.007))
        digits.show_seconds(max(0,min(t,21.2)-7.3))
        top = ramp(t,7.8,10)*(1-ramp(t,19.7,22))
        camera(stage,mix((3,-4,4.2),(1.2,-2.4,7),top),margin=1.38,target=(0,110,34))
    return update
