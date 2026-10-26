"""Echo Trail: listen, press the spoken shape, replay and see local progress."""
from concept_3d.scenes._game_interaction import KeySequence, NativeLCD, camera_dolly, key_pairs

SPEC = {
    'slug': 'echo-trail', 'duration': 26,
    'captions': [(0.5, 2.0, 'A short listening round.'), (2.4, 4.6, 'Start with an adult.'),
                 (4.95, 6.3, 'Press the circle.'),
                 (8.25, 9.35, 'Circle.'),
                 (9.95, 11.3, 'Press the diamond.'),
                 (12.75, 13.85, 'Diamond.'),
                 (16.3, 18.5, 'Replay the cue.'),
                 (18.75, 20.1, 'Press the diamond.'),
                 (22.85, 25.3, 'Diamond. Next turn.')],
    'foley': [(3.35, 'click'), (7.9, 'click'), (12.4, 'click'),
              (17.5, 'click'), (22.4, 'click')],
    'tones': [(8.25, .16, 659.25), (12.75, .16, 659.25), (22.75, .16, 659.25)],
    'audio_cues': [(4.95, 'Press the circle.'), (8.25, 'Circle.'),
                  (9.95, 'Press the diamond.'), (12.75, 'Diamond.'),
                  (18.75, 'Press the diamond.'), (22.85, 'Diamond. Next turn.')],
    'limits': ['Spoken cues and progress digits illustrate the proposed local offline game.',
               'The existing adult SET/pause control illustrates starting and replaying a short cue.',
               'No microphone, speech recognition, extra LEDs or new screen is added.']
}


def build(stage):
    prefix = '3539001_B_'
    pairs = key_pairs(prefix, ['SET', 'K1', 'K3'])
    presses = KeySequence(stage, pairs, [
        ('SET', 2.0, 3.35, 3.6, 3.95, 4.75),
        ('K1', 6.55, 7.9, 8.25, 8.6, 9.7),
        ('K3', 11.0, 12.4, 12.75, 13.1, 14.2),
        ('SET', 16.15, 17.5, 17.8, 18.15, 19.25),
        ('K3', 21.0, 22.4, 22.75, 23.1, 24.2),
    ], radii={'SET': 4.8, 'K1': 13.5, 'K3': 13.5},
       wrist={'SET': (2.0, -.2, 1.1), 'K1': (-1.5, .8, .95), 'K3': (2.0, -.2, 1.1)})
    display = NativeLCD(stage, prefix+'reflective_LCD_face', prefix+'LCD_segments')

    def update(t):
        camera_dolly(stage, t, (-2.0, -4.8, 4.5), wide=1.45, close=1.27)
        presses.update(t)
        display.set('0000' if t < 8.15 else '0001' if t < 12.65 else '0002' if t < 22.65 else '0003')
    update(0)
    return update
