"""Pattern Pebble: start, watch two native cue keys, repeat and replay."""
from concept_3d.scenes._game_interaction import ExistingLight, KeySequence, camera_dolly, key_pairs, pulse

SPEC = {
    'slug': 'pattern-pebble', 'duration': 26,
    'captions': [(0.5, 2.3, 'A short sequence.'), (2.7, 4.7, 'Start a round.'),
                 (5.1, 7.4, 'Watch and listen.'), (8.0, 14.7, 'Repeat the two shapes.'),
                 (18.1, 20.6, 'Replay or share a turn.')],
    'foley': [(3.45, 'click'), (9.25, 'click'), (12.65, 'click'), (19.4, 'click')],
    'tones': [(5.25, .40, 523.25), (6.55, .40, 783.99),
              (9.45, .22, 523.25), (12.85, .22, 783.99),
              (21.25, .40, 523.25), (22.55, .40, 783.99)],
    'audio_cues': [],
    'limits': ['Local cue lights/tones are illustrative proposed behavior on existing response caps.',
               'Other existing keys reuse the original 0.8 mm key travel; no new hardware.']
}


def build(stage):
    pairs = key_pairs('3538962_A_', ['START', 'K6', 'K1'])
    presses = KeySequence(stage, pairs, [
        ('START', 2.3, 3.45, 3.7, 4.0, 4.85),
        ('K6', 8.0, 9.25, 9.65, 10.0, 11.0),
        ('K1', 11.35, 12.65, 13.0, 13.35, 14.4),
        ('START', 18.1, 19.4, 19.65, 20.0, 20.85),
    ], radii={'START': 6.5, 'K6': 12.5, 'K1': 12.5}, wrist=(1.5, .8, 1.2))
    lights = {key: ExistingLight(stage, pairs[key][0], 1.5) for key in ['K6', 'K1']}

    def update(t):
        camera_dolly(stage, t, (-2.8, -4.4, 4.5), wide=1.42, close=1.24)
        amounts = presses.update(t)
        first = max(pulse(t, 5.2, 5.9), pulse(t, 21.2, 21.9), amounts['K6']*.65)
        second = max(pulse(t, 6.5, 7.2), pulse(t, 22.5, 23.2), amounts['K1']*.65)
        lights['K6'].set(first)
        lights['K1'].set(second)
    update(0)
    return update
