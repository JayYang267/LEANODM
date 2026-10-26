"""Quiz Compass: offline question, physical A answer and dedicated replay."""
from concept_3d.scenes._game_interaction import ExistingLight, KeySequence, camera_dolly, pulse

QUESTION = 'Which keeps you dry: umbrella, ball or sun?'

SPEC = {
    'slug': 'quiz-compass-audio-quiz-game-concept', 'duration': 28,
    'captions': [(0.6, 2.1, 'An offline audio question.'),
                 (2.35, 3.75, 'Which keeps you dry?'),
                 (3.75, 5.75, 'Umbrella, ball or sun?'),
                 (7.2, 8.85, 'Choose A, B or C.'),
                 (9.0, 11.2, 'A. An umbrella keeps you dry.'),
                 (13.0, 14.5, 'Replay the question.'),
                 (14.8, 16.2, 'Which keeps you dry?'),
                 (16.2, 18.2, 'Umbrella, ball or sun?'),
                 (22.2, 24.5, 'A. An umbrella keeps you dry.'),
                 (24.5, 26.5, 'Take another turn.')],
    'foley': [(8.55, 'click'), (13.8, 'click'), (21.75, 'click')],
    'tones': [(6.6, .16, 659.25), (19.1, .16, 659.25)],
    'audio_cues': [(2.35, QUESTION), (9.0, 'A. An umbrella keeps you dry.'),
                  (14.8, QUESTION), (22.2, 'A. An umbrella keeps you dry. Take another turn.')],
    'limits': ['Question content and stored-answer feedback are illustrative proposed offline behavior.',
               'Only existing amber state-light geometry pulses; no color-coded correctness claim is made.',
               'The finger clears the original raised glyph top by adding 0.23 mm to cap-face alignment.',
               'Dedicated replay reuses the source 0.8 mm key travel. No speech recognition or new hardware.']
}


def build(stage):
    pairs = {'A': ('answer_0', 'answer_graphic_0'),
             'REPLAY': ('replay_key', 'replay_graphic')}
    presses = KeySequence(stage, pairs, [
        ('A', 7.15, 8.55, 8.9, 9.25, 10.4),
        ('REPLAY', 12.4, 13.8, 14.1, 14.45, 15.6),
        ('A', 20.35, 21.75, 22.1, 22.45, 23.7),
    ], radii={'A': 10.5, 'REPLAY': 7.5}, wrist=(1.8, .5, 1.4),
       extra_clearance_mm={'A': .23, 'REPLAY': .23})
    lights = [ExistingLight(stage, name, 2.3) for name in ['state_light_-14', 'state_light_0', 'state_light_14']]

    def update(t):
        camera_dolly(stage, t, (-2.6, -4.4, 4.9), wide=1.43, close=1.25)
        amounts = presses.update(t)
        listening = max(pulse(t, 2.35, 6.5), pulse(t, 14.8, 19.0))*.45
        acknowledgment = max(pulse(t, 8.75, 9.55), pulse(t, 21.95, 22.75))
        lights[0].set(acknowledgment)
        lights[1].set(max(listening, acknowledgment, amounts['REPLAY']*.5))
        lights[2].set(acknowledgment)
    update(0)
    return update
