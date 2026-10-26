import type { ImageMetadata } from 'astro';
import image58 from '../assets/production-equipment/haitian-molding-reference.webp';
import image59 from '../assets/production-equipment/selective-soldering-reference.webp';
import image60 from '../assets/production-equipment/smt-placement-reference.webp';
import image61 from '../assets/production-equipment/wire-bonding-reference.webp';
import image62 from '../assets/production-equipment/ultrasonic-station-photo.webp';
import image63 from '../assets/production-equipment/screw-fastening-photo.webp';
import image64 from '../assets/production-equipment/automatic-soldering-photo.webp';
import image65 from '../assets/production-equipment/label-applicator-photo.webp';
import image66 from '../assets/production-equipment/battery-cover-gasket-photo.webp';
import image67 from '../assets/production-equipment/die-attach-machine-photo.webp';
import image68 from '../assets/production-equipment/smt-placement-photo.webp';
import image69 from '../assets/production-equipment/aoi-inspection-photo.webp';
import image70 from '../assets/production-equipment/uv-printer-photo.webp';
import image71 from '../assets/production-equipment/six-color-transfer-photo.webp';
import image72 from '../assets/production-equipment/printing-workstations-photo.webp';
import image73 from '../assets/production-equipment/printing-ultrasonic-photo.webp';
import image74 from '../assets/production-equipment/uv-workshop-photo.webp';
import image75 from '../assets/production-equipment/molding-operations-photo.webp';
import image76 from '../assets/production-equipment/molding-workshop-photo.webp';
import image77 from '../assets/production-equipment/soldering-station-photo.webp';
import image78 from '../assets/production-equipment/wire-bonding-workshop-photo.webp';
import image79 from '../assets/production-equipment/smt-workshop-photo.webp';
import image80 from '../assets/production-equipment/packaging-workshop-photo.webp';
import image81 from '../assets/production-equipment/assembly-workshop-photo.webp';

export interface ProductionEquipmentVisual {
  src: ImageMetadata;
  slide: number;
  asset: string;
  section: 'molding' | 'decoration' | 'electronics' | 'assembly';
  kind: 'reference' | 'photograph';
  title: string;
  caption: string;
  alt: string;
  note?: string;
}

// Each picture in the six supplied source slides has one explicit page position.
// Reference images identify the depicted equipment; they are not fleet-wide specs.
export const equipmentVisuals = {
  image58: { src: image58, slide: 17, asset: 'image58', section: 'molding', kind: 'reference', title: 'Haitian injection molding equipment', caption: 'Haitian injection molding equipment.', alt: 'Haitian injection molding machine shown in the company equipment reference', note: 'The company profile labels this equipment example 120–380 T. The range does not describe every molding machine.' },
  image59: { src: image59, slide: 17, asset: 'image59', section: 'electronics', kind: 'reference', title: 'FS-250C selective wave soldering', caption: 'FS-250C selective wave soldering equipment.', alt: 'FS-250C selective wave soldering machine shown in the company equipment reference' },
  image60: { src: image60, slide: 18, asset: 'image60', section: 'electronics', kind: 'reference', title: 'SMT pick-and-place equipment', caption: 'Automatic SMT pick-and-place equipment.', alt: 'SMT component placement machine shown in the company equipment reference' },
  image61: { src: image61, slide: 18, asset: 'image61', section: 'electronics', kind: 'reference', title: 'ASM AB520 wire bonding', caption: 'ASM AB520 wire bonding equipment.', alt: 'ASM AB520 wire bonding machine shown in the company equipment reference' },
  image62: { src: image62, slide: 19, asset: 'image62', section: 'assembly', kind: 'photograph', title: 'Ultrasonic welding equipment', caption: 'Ultrasonic welding equipment.', alt: 'Ultrasonic welding machine with a rotary work fixture' },
  image63: { src: image63, slide: 19, asset: 'image63', section: 'assembly', kind: 'photograph', title: 'Automatic screwdriving equipment', caption: 'Automatic screwdriving equipment.', alt: 'Automatic screwdriving equipment with paired component fixtures' },
  image64: { src: image64, slide: 19, asset: 'image64', section: 'assembly', kind: 'photograph', title: 'Automated soldering equipment', caption: 'Automated soldering equipment.', alt: 'Automated soldering station showing the soldering head and work fixture' },
  image65: { src: image65, slide: 19, asset: 'image65', section: 'assembly', kind: 'photograph', title: 'Automatic label applicator', caption: 'Automatic label application equipment.', alt: 'Automatic label application equipment on an assembly workstation' },
  image66: { src: image66, slide: 19, asset: 'image66', section: 'assembly', kind: 'photograph', title: 'Battery-cover gasket placement', caption: 'Automatic battery-cover gasket placement equipment.', alt: 'Battery-cover gasket placement equipment with a rotary fixture' },
  image67: { src: image67, slide: 20, asset: 'image67', section: 'electronics', kind: 'photograph', title: 'IC die bonding equipment', caption: 'Automatic IC die bonding equipment.', alt: 'IC die bonding equipment showing the placement station' },
  image68: { src: image68, slide: 20, asset: 'image68', section: 'electronics', kind: 'photograph', title: 'SMT placement equipment', caption: 'SMT placement equipment on the production floor.', alt: 'SMT placement equipment with component feeders' },
  image69: { src: image69, slide: 20, asset: 'image69', section: 'electronics', kind: 'photograph', title: 'AOI PCB inspection equipment', caption: 'AOI PCB inspection equipment.', alt: 'Automated optical inspection equipment for PCB assemblies' },
  image70: { src: image70, slide: 20, asset: 'image70', section: 'decoration', kind: 'photograph', title: 'UV printing equipment', caption: 'UV printing equipment.', alt: 'UV printing machine and its working bed' },
  image71: { src: image71, slide: 20, asset: 'image71', section: 'decoration', kind: 'photograph', title: 'Six-color transfer printing equipment', caption: 'Six-color transfer printing equipment.', alt: 'Six-color transfer printing equipment with work fixtures' },
  image72: { src: image72, slide: 21, asset: 'image72', section: 'decoration', kind: 'photograph', title: 'Printing and ultrasonic workstations', caption: 'Printing and ultrasonic work area: operator workstations.', alt: 'Operators and workstations in the printing and ultrasonic work area' },
  image73: { src: image73, slide: 21, asset: 'image73', section: 'decoration', kind: 'photograph', title: 'Printing and ultrasonic equipment area', caption: 'Printing and ultrasonic work area: equipment aisle.', alt: 'Equipment and material trays along the printing and ultrasonic workshop aisle' },
  image74: { src: image74, slide: 21, asset: 'image74', section: 'decoration', kind: 'photograph', title: 'UV printing workshop', caption: 'UV printing equipment in the decoration workshop.', alt: 'UV printing equipment in a marked workshop area' },
  image75: { src: image75, slide: 21, asset: 'image75', section: 'molding', kind: 'photograph', title: 'Molding production area', caption: 'Molding production area and component handling.', alt: 'Operators and component bins in the molding production area' },
  image76: { src: image76, slide: 21, asset: 'image76', section: 'molding', kind: 'photograph', title: 'Molding workshop', caption: 'Molding equipment and the workshop layout.', alt: 'Molding equipment beside a marked workshop aisle' },
  image77: { src: image77, slide: 22, asset: 'image77', section: 'electronics', kind: 'photograph', title: 'Soldering work area', caption: 'Soldering workstations on the production floor.', alt: 'Soldering workstations arranged along an electronics workshop aisle' },
  image78: { src: image78, slide: 22, asset: 'image78', section: 'electronics', kind: 'photograph', title: 'Wire bonding workshop', caption: 'Wire bonding workstations for chip-on-board assembly.', alt: 'Operators at wire bonding equipment in a dedicated electronics work area' },
  image79: { src: image79, slide: 22, asset: 'image79', section: 'electronics', kind: 'photograph', title: 'SMT workshop', caption: 'SMT equipment and component feeding in the electronics workshop.', alt: 'Surface-mount assembly equipment and component reels along the SMT workshop aisle' },
  image80: { src: image80, slide: 22, asset: 'image80', section: 'assembly', kind: 'photograph', title: 'Packaging workshop', caption: 'Packaging workstations and carton handling on the production floor.', alt: 'Operators, work tables and cartons in the packaging area' },
  image81: { src: image81, slide: 22, asset: 'image81', section: 'assembly', kind: 'photograph', title: 'Assembly workshop', caption: 'Assembly workstations on Xinyinhai’s production floor.', alt: 'Assembly workstations, operators and a marked central aisle inside Xinyinhai’s workshop' },
} satisfies Record<string, ProductionEquipmentVisual>;
