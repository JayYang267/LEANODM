function photo(asset: string, caption: string, alt = caption) {
  return { asset, caption, alt };
}

export const finishedGoodsChecks = [
  { name: 'Tap the unit', detail: 'Check for loose material inside the product, such as plastic fragments, stray screws or solder dross.' },
  { name: 'Check the screws', detail: 'Look for missing, raised or rusted screws and verify the applicable assembly requirements.' },
  { name: 'Exercise the functions', detail: 'Check power, any applicable test mode and normal use. Operate the switches and buttons, then verify LEDs and sound.' },
  { name: 'Review appearance', detail: 'Inspect molded surfaces, printed items and markings, paint, stickers and binding against the product reference.' },
  { name: 'Verify contents and packaging', detail: 'Check for missing or extra parts, contamination in the package and visible damage to the packaging.' },
];

export const trainingExamples = [
  {
    id: 'biqc-external-contamination',
    title: 'External contamination',
    slides: 'Slide 10',
    description: 'Check for insects, hair and blood during the applicable inspection steps. The deck assigns CR to all three examples.',
    figures: [
      photo('image8.png', 'Insect contamination · CR'),
      photo('image7.png', 'Hair contamination · CR'),
      photo('image6.png', 'Blood contamination · CR'),
    ],
  },
  {
    id: 'biqc-internal-contamination',
    title: 'Loose material inside the unit',
    slides: 'Slide 11',
    description: 'The tapping check looks for foreign material inside the housing. The training deck assigns MA to these three examples.',
    figures: [
      photo('image11.png', 'Loose plastic inside the unit · MA'),
      photo('image10.png', 'Loose screw inside the unit · MA'),
      photo('image9.png', 'Solder dross inside the unit · MA'),
    ],
  },
  {
    id: 'biqc-screw-examples',
    title: 'Screw installation and condition',
    slides: 'Slide 18',
    description: 'Distinguish a missing screw from a screw that sits proud of its seat or shows rust.',
    figures: [
      photo('image30.png', 'Missing screw · CR'),
      photo('image29.png', 'Raised screw · MA'),
      photo('image28.png', 'Rusted screw · MI'),
    ],
  },
  {
    id: 'biqc-assembly-electronics',
    title: 'Assembly and functional checks',
    slides: 'Slides 22–23',
    description: 'Check assembly direction, button height and operation, and whether all intended LEDs illuminate.',
    figures: [
      photo('image38.png', 'Clasp installed in reverse · MA'),
      photo('image39.jpeg', 'Recessed button · MI'),
      photo('image41.png', 'Sliding switch and button check'),
      photo('image40.png', 'Some LEDs fail to illuminate · MA'),
    ],
  },
  {
    id: 'biqc-book-contents',
    title: 'Book assembly and missing contents',
    slides: 'Slides 24–25',
    description: 'Check page sequence and condition alongside completeness of the product and its accessories.',
    figures: [
      photo('image43.png', 'Duplicate pages · CR'),
      photo('image44.png', 'Wrinkled page · MI'),
      photo('image45.png', 'Missing clasp · CR'),
      photo('image46.png', 'Missing page · CR'),
    ],
  },
  {
    id: 'biqc-packaging-examples',
    title: 'Packaging condition',
    slides: 'Slide 26',
    description: 'Inspect the retail carton and protective packaging while checking the packaged contents.',
    figures: [
      photo('image48.jpeg', 'Damaged retail carton · MI'),
      photo('image47.png', 'Dirty bubble bag · MI'),
    ],
  },
];

export const appearanceExamples = [
  {
    id: 'biqc-molded-parts',
    title: 'Molded parts, joints and surfaces',
    slides: 'Slides 12–17',
    figures: [
      photo('image12.png', 'Incomplete molding (short shot) · MI'),
      photo('image13.png', 'Wrong specification · CR'),
      photo('image14.png', 'Crack · CR'),
      photo('image16.png', 'Deformation affecting function · MA'),
      photo('image15.png', 'Mixed color · MI'),
      photo('image18.png', 'Surface damage on a molded part · MI'),
      photo('image17.png', 'Second surface-damage example · MI'),
      photo('image19.png', 'Third surface-damage example · MI'),
      photo('image20.png', 'Surface damage shown across two views · MI'),
      photo('image21.png', 'Non-sharp gate vestige · MI'),
      photo('image23.png', 'Gap from a missed ultrasonic weld · CR'),
      photo('image22.png', 'Gap caused by deformation · MI'),
      photo('image24.png', 'Air-trap mark · MI'),
      photo('image27.png', 'Soiling on a molded surface · MI'),
      photo('image26.png', 'Second soiling example · MI'),
      photo('image25.png', 'Excess glue · MI'),
    ],
  },
  {
    id: 'biqc-printed-painted-labeled',
    title: 'Printing, paint and stickers',
    slides: 'Slides 19–21',
    figures: [
      photo('image31.png', 'Missing print on a button · CR'),
      photo('image32.png', 'Incomplete paint coverage · MI'),
      photo('image33.png', 'Paint overspray · MI'),
      photo('image37.png', 'Lifted sticker · MI'),
      photo('image36.png', 'Wrinkled sticker · MI'),
      photo('image35.png', 'Sticker color difference · MI'),
    ],
  },
];

export const appearanceCases = [
  {
    id: 'biqc-pp-molding',
    title: 'Fracture at a polypropylene mating feature',
    slide: 30,
    finding: 'Customer complaints reported fractures at the fitting point. The case traced the issue to insufficient control of the molding conditions for temperature-sensitive polypropylene.',
    followup: 'Set the molding temperature in the suitable range, check molding output more often, and store molded parts flat without compressing them.',
    figures: [
      photo('image57.png', 'Product and molded feature in the case'),
      photo('image55.jpeg', 'First view of the failed fitting area'),
      photo('image56.jpeg', 'Second view of the failed fitting area'),
    ],
  },
  {
    id: 'biqc-loose-gate',
    title: 'Gate fragment released inside an assembly',
    slide: 32,
    finding: 'A long internal point-gate vestige contacted the upper housing. Ultrasonic welding broke it off, and the red plastic fragment later fell out during use.',
    followup: 'Remove internal gate vestiges. The design review proposed a shorter, thicker internal gate where applicable, with clearance from adjacent parts and geometry that prevents passage through the opening.',
    figures: [
      photo('image62.jpeg', 'Assembly view from the case'),
      photo('image61.jpeg', 'Internal point-gate location'),
      photo('image60.png', 'Gate and loose-fragment detail'),
    ],
  },
  {
    id: 'biqc-mold-selection',
    title: 'Wrong mold used for the production run',
    slide: 36,
    finding: 'The pilot part had the required eight corners. The wrong mold produced a six-corner part in mass production.',
    followup: 'Compare molded parts from mass production with both the signed reference sample and the drawing.',
    figures: [
      photo('image68.jpeg', 'Eight-corner reference part'),
      photo('image69.jpeg', 'Six-corner part from the wrong mold'),
    ],
  },
  {
    id: 'biqc-tool-texture',
    title: 'Tool wear changed the surface finish',
    slide: 38,
    finding: 'First-piece evaluation on a repeat run of 13,000 units found a glossy edge where the specification called for a textured finish. The case reports a 50% defect rate and attributes it to worn mold texture.',
    followup: 'During the molding run, check output from every mold identifier against the signed reference sample each day.',
    figures: [
      photo('image74.jpeg', 'Component shown in the surface-finish case'),
      photo('image75.jpeg', 'Glossy reject compared with the approved textured edge'),
    ],
  },
];
