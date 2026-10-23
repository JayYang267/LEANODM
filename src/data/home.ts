// Copy supplied on 2026-10-20. Editorial instructions and deferred material
// are private. Certification status is user-supplied, not independently verified.
export const homeCopy = {
  welcome: 'Welcome to LEANODM',
  title: 'Custom Plastic & Electronic Product Lean Manufacturing',
  intro: 'LeanODM develops and mass-produces products tailored to your needs through lean manufacturing.',
  history: 'Since 1988',
  experience: 'Nearly 40 years of electronics manufacturing experience',
  developed: 'Developed and manufactured 3,000+ products in collaboration with customers',
  delivered: 'Delivered 1,000,000,000+ units to many renowned brands / government agencies worldwide',
  certificationNote: 'Color indicates currently active status; black and white indicates work we have completed or are capable of undertaking',
  valueIntro: 'Lean manufacturing is not out of reach, nor does it mean making products more expensive. It is not about keeping up appearances, and it is certainly not about pursuing value for money.',
  valueBody: 'With the customer’s target quality defined, lean manufacturing uses factory management to comprehensively and systematically manage production materials, equipment, processes, personnel, the production environment, production stages, quality management and other production requirements, enabling employees to deliver products to customers with a sense of fulfillment: products have exceptionally competitive advantages in price and cost while matching or even far exceeding industry quality standards.',
};

export const certificationItems = [
  { name: 'ISO9001', active: true },
  { name: 'SMETA', active: true },
  { name: 'CCC', active: true, image: '/brand/certifications/ccc.jpg' },
  { name: 'Disney', active: true },
  { name: 'FAMA', active: false },
  { name: 'BANDAI', active: true, image: '/brand/certifications/bandai-blue.png' },
  { name: 'BANDAI', active: true, image: '/brand/certifications/bandai-red.png' },
  { name: 'ICTI', active: false },
  { name: 'ESCP', active: false },
  { name: 'Sedex', active: false, image: '/brand/certifications/sedex.svg' },
  { name: 'SMETA', active: false },
  { name: 'amfori BSCI', active: false },
  { name: 'SA8000', active: false, image: '/brand/certifications/sa8000.jpg' },
  { name: 'ISO 14001', active: false },
  { name: 'ISO 45001', active: false },
  { name: 'GCC', active: false },
  { name: 'SABER', active: false, image: '/brand/certifications/saber.svg' },
  { name: 'CGSR', active: false },
  { name: 'SIRIM', active: false, image: '/brand/certifications/sirim.png' },
] as const;

export const productScope = [
  { name: 'Educational toys', icon: 'blocks' },
  { name: 'Gifts and souvenirs', icon: 'gift' },
  { name: 'IP stationery', icon: 'pencil-ruler' },
  { name: 'Consumer electronics', icon: 'cpu' },
];
export const customerTypes = [
  { title: 'Entrepreneurs & Startups', text: 'For individuals and teams starting to develop a product. We help you move from an idea through development to mass production.', icon: 'lightbulb' },
  { title: 'IP Owners & Brands', text: 'For IP companies and product brands with established production, seeking to improve product quality, strengthen brand value and increase business competitiveness.', icon: 'gem' },
  { title: 'Business, Government & Events', text: 'For companies and government agencies seeking corporate gifts or mascot merchandise for sporting events and other activities.', details: 'Relevant buyers include companies purchasing standard products in bulk, official event organizers and import agents.', icon: 'flag' },
];
export const workflowSteps = [
  { number: '01', title: 'Send a request', icon: 'send', text: 'Send a request, reference sample or specifications, along with your target market and estimated quantity.' },
  { number: '02', title: 'Review & meeting', icon: 'clipboard-check', text: 'Meet with you to discuss project requirements, review feasibility and customization options, and align on MOQ, estimated costs and timelines. Together, we confirm the project scope and approve the project kickoff.' },
  { number: '03', title: 'Develop & approve', icon: 'layers', text: 'Develop and refine the product, then approve samples against agreed requirements.' },
  { number: '04', title: 'Start production', icon: 'factory', text: 'Move into production with agreed specifications, process checks and final inspection.' },
  { number: '05', title: 'Packaging & delivery', icon: 'truck', text: 'Pack finished products to the agreed requirements, prepare shipping documents, and coordinate loading, transportation and delivery to the agreed destination.' },
];
export const manufacturingEras = [
  { title: 'China Manufacturing 1.0: Value for money', text: '(Sacrificing quality in pursuit of low prices leads to progressively poorer quality. Consumers notice the decline, gradually lose trust in the brand, and the brand ultimately loses market share.)' },
  { title: 'China Manufacturing 2.0: Exceptional quality', text: '(Sacrificing price competitiveness in pursuit of exceptional quality serves only the top end of the market, representing a small share. Market share is easily lost during significant economic fluctuations. The brand appears premium, but its revenue struggles to sustain healthy long-term growth.)' },
  { title: 'China Manufacturing 3.0: Quality-to-price ratio', text: '(A lean production management system balances most consumers’ dual demands for price and quality. Lean practices during production (standardized processes, visual collaboration and quality control at defined checkpoints) control product quality, putting it above the standards of competing companies in the same industry. The brand achieves both strong profits and a reputation for exceptional quality, with Benesse as a reference.)' },
];
// Editorially expanded from the supplied feedback at the user's request.
export const testimonials = [
  { title: 'Quality We Can Trust', name: 'Kenji Sato', country: 'Japan', text: 'I sincerely appreciate the quality of the products. The defect rate is more than 20 times lower than the market average. As a brand owner, knowing that we have a trustworthy partner behind our supply chain brings a real sense of reassurance. Quality matters because every product carries our name and influences the confidence our customers place in us. Having a partner we can rely on allows us to focus on building our brand and serving our customers with greater peace of mind. To have a team that has our back and shares our concern for quality is something I deeply value. I feel fortunate and happy to have found such a dependable manufacturing partner.' },
  { title: 'Lean Management in Practice', name: 'Alex Miller', country: 'United States', text: 'Lean production management is clearly demonstrated at Xinyinhai. They are not simply keeping up appearances; they put 5S management and Toyota’s lean management philosophy into practice with real commitment. What impresses me is the attention to the many details that together shape how a factory works. These details make lean management feel tangible, rather than something that exists only in a presentation. To me, this reflects an attitude of taking manufacturing seriously and a determination to keep improving. It is encouraging to see principles carried through into everyday work, because that is where their value becomes clear. I sincerely hope Xinyinhai continues on this path and grows into an outstanding benchmark for lean manufacturing.' },
  { title: 'Support for New Brands', name: 'Lukas Weber', country: 'Germany', text: 'Amazing, beyond amazing. After my first visit to the Xinyinhai factory, I do not know how to put my feelings into words. Perhaps you could schedule a visit yourself. They are exceptionally open to welcoming any visitor—even when I brought my own supplier along! I admire the fact that they work with major international brands while also welcoming a brand just getting started like mine, setting up a dedicated project discussion group to address the product quality issues I was facing. I was deeply moved by this, and I hope to begin a substantive partnership with this factory soon!' },
];
// Editorial answers are kept separate from the supplied customer feedback.
export const homeFaqs = [
  { question: 'Is it safe to work with you?', answer: 'Before working together, we recommend verifying the contracting party and relevant qualifications, and agreeing on product requirements, sample approval, intellectual property and confidentiality arrangements, as well as quotation, payment, delivery and acceptance terms. You can review the factory’s production and quality management documentation according to your project needs before deciding on the scope of cooperation. Specific commitments are governed by the documents confirmed by both parties.' },
  { question: 'Our business model is exclusively OEM and ODM, without serving end consumers. This is also why we have remained a trusted partner to our customers for 40 years', answer: 'Our business focuses on OEM and ODM product development and manufacturing partnerships, without selling to end consumers. Projects are developed around the customer’s brand, channels and product requirements; product rights, the permitted use of materials, confidentiality requirements and each party’s responsibilities need to be defined before cooperation begins. Long-term cooperation is built on clear responsibilities, ongoing communication and delivery requirements confirmed by both parties.' },
  { question: 'Why do consumer electronic products need lean manufacturing more than any other products?', answer: 'Consumer electronic products typically involve multiple areas, including mechanical structure, electronic components, assembly, and software or firmware. Small deviations can affect functionality, consistency and the user experience. Lean manufacturing uses standardized work, visual processes, feedback on abnormalities and continuous improvement to help these areas work together and reduce rework and waste. Lean practices are equally valuable in other manufacturing fields; specific inspection, testing and compliance requirements still need to be determined according to the product and target market.' },
  { question: 'Do you work only with large customers and not small ones?', answer: 'We also welcome project discussions with entrepreneurs and teams starting to develop products, as well as growing brands. Whether a partnership is suitable depends on an assessment of product complexity, development scope, estimated quantity, budget and timing requirements, rather than customer size alone. You can start by sharing an idea, reference sample or specifications, along with your target market and estimated quantity; MOQ, costs and lead times are confirmed after project review.' },
];
