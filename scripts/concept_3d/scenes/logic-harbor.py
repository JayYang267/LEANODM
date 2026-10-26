"""Logic Harbor: manually match card 0012, confirm, answer its triangle task."""
from concept_3d.scenes._game_interaction import KeySequence, NativeLCD, camera_dolly, key_pairs

SPEC = {
    'slug': 'logic-harbor', 'duration': 28,
    'captions': [(0.5, 2.4, 'One card. One question.'), (2.7, 5.5, 'Match card ID 0012.'),
                 (6.3, 8.8, 'Confirm the ID.'), (9.5, 11.9, 'Find the matching triangle.'),
                 (11.95, 14.1, 'Choose its answer button.'),
                 (14.2, 16.8, 'Triangle. Three sides.'),
                 (18.2, 20.5, 'Try the card again.'),
                 (23.45, 25.6, 'A triangle matches this card.'),
                 (25.65, 27.7, 'Discuss, then change cards.')],
    'foley': [(4.0, 'click'), (7.5, 'click'), (13.75, 'click'),
              (19.1, 'click'), (23.0, 'click')],
    'tones': [],
    'audio_cues': [(14.2, 'Triangle. Three sides.'), (23.45, 'A triangle matches this card.')],
    'limits': ['Card ID is entered by the adult SET and ENTER controls, never read automatically.',
               'Only content inside the existing reflective LCD changes; the native card and print remain.',
               'Audio feedback and reuse of the source key travel are illustrative proposed behavior.']
}


def build(stage):
    prefix = '3538976_B_'
    pairs = key_pairs(prefix, ['SET', 'ENTER', 'K2'])
    presses = KeySequence(stage, pairs, [
        ('SET', 2.6, 4.0, 4.3, 4.65, 5.5),
        ('ENTER', 6.1, 7.5, 7.8, 8.15, 9.05),
        ('K2', 12.3, 13.75, 14.1, 14.45, 15.5),
        ('ENTER', 17.8, 19.1, 19.4, 19.75, 20.7),
        ('K2', 21.65, 23.0, 23.35, 23.7, 24.75),
    ], radii={'SET': 4.8, 'ENTER': 4.8, 'K2': 11.5}, wrist=(2.0, -.2, 1.1))
    display = NativeLCD(stage, prefix+'reflective_LCD_face', prefix+'LCD_segments')

    def update(t):
        camera_dolly(stage, t, (-2.5, -4.6, 4.8), wide=1.44, close=1.28)
        presses.update(t)
        display.set('0011' if t < 4.15 else '0012')
    update(0)
    return update
