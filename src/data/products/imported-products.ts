import { SITE } from '../../config/site';

// Explicit product-content migration requested on 2026-10-26.
// Keep source claims as supplied; these records do not establish Xinyinhai's
// authorship, certification, inventory, pricing or an independent safety test.
const categoryPath = '/products/plastic-electronic-toys/learning-educational-intelligent-sound-toys/interactive-sound-toys/';
const slug = 'baby-musical-light-up-drum';
const imageRoot = `/images/products/${slug}`;
const path = `${categoryPath}${slug}/`;

export const babyMusicalDrum = {
  slug,
  name: 'Baby Musical Electronic Toy With Lights and Sounds Light-Up Drum Toys  Early Hand Development for Babies',
  path,
  categoryPath,
  canonical: new URL(path, SITE.url).href,
  sourceUrl: 'https://www.shengyip.com/product-baby-musical-electronic-toy-with-lights-and-sounds-light-up-drum-toys--early-hand-development-for-babies',
  image: `${imageRoot}/hero.webp`,
  imageAlt: 'Baby musical light-up drum with palm-shaped pads and green handle',
  imageWidth: 1500,
  imageHeight: 1500,
  specification: [
    { label: 'Place of Origin', value: 'China' },
    { label: '', value: 'Guangdong' },
    { label: 'Material', value: 'Plastic' },
    { label: 'Brand Name', value: 'OEM' },
    { label: 'Age', value: '6 months~5years old' },
    { label: 'Model Number', value: 'SY' },
    { label: 'Logo', value: 'OEM LOGO' },
  ],
  description: '♫ 100% Safe: We use imported ABS materials to be environmentally friendly, non-toxic and wear-resistant, 100% safe. The raw materials are once manufactured into a model, high-quality HIFI sound control system, and the music is clear. The pattern is clear and cute, and is very popular among children.',
  descriptionImages: [
    { src: `${imageRoot}/description-1.webp`, alt: 'Baby playing the drum with illuminated palm-shaped pads', width: 1500, height: 1500 },
    { src: `${imageRoot}/description-2.webp`, alt: 'Close-up of the drum’s rounded edges, power switch, and music buttons', width: 1500, height: 1500 },
    { src: `${imageRoot}/description-3.webp`, alt: 'Drum details showing rounded design, palm-shaped pads, raised button, and indicator lights', width: 1500, height: 1288 },
    { src: `${imageRoot}/description-4.webp`, alt: 'Drum features: two volume levels, animal sounds, drum beats, piano music, English songs, and light-up grip', width: 1500, height: 1500 },
  ],
  packing: [
    '1.Internal packing with OPP bags(to prevent scratches)',
    '2.External packing with common carton',
    '3.Free-fumigation Wooden Pallet',
  ],
  packingImage: { src: `${imageRoot}/packing.jpg`, alt: 'OPP bags and shipping cartons stacked on a wooden pallet', width: 1900, height: 1000 },
  delivery: [
    { label: 'Sample mailing time.', value: 'The mailing time of the sample is 5-14 days and express delivery usually needs around 3-5 day.' },
    { label: 'Delivery port.', value: 'Shenzhen Port.' },
    { label: 'Lead time.', value: 'Shipment within 40 days after payment.' },
  ],
  deliveryImage: { src: `${imageRoot}/delivery.webp`, alt: 'Air, sea, and road freight illustration', width: 600, height: 249 },
};

export const importedProducts = [babyMusicalDrum];
