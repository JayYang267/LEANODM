export const assemblyRoute = '/manufacturing/assembly-packaging/';

export const assemblyNavigation = [
  { label: 'Process', href: '#assembly-process' },
  { label: 'Fastening', href: '#screw-fastening' },
  { label: 'Soldering', href: '#hand-soldering' },
  { label: 'Quality & packing', href: '#final-inspection' },
  { label: 'FAQ', href: '#faq' },
] as const;

// Public summaries only. Source identities and claim boundaries are recorded in
// docs/assembly-packaging-delivery.md, outside the published site.
export const assemblyProcess = [
  { name: 'Components', detail: 'Plastic parts, springs and fixing components', icon: 'component' },
  { name: 'Mechanical assembly', detail: 'Locate spring, fit lock, align housings', icon: 'layers-2' },
  { name: 'Fastening', detail: 'Secure the housing in the defined order', icon: 'wrench' },
  { name: 'Lubrication', detail: 'Apply at specified sliding surfaces', icon: 'droplet' },
  { name: 'Functional assembly', detail: 'Fit the internal component into the body', icon: 'between-horizontal-start' },
  { name: 'Final QC', detail: 'Check appearance, engagement and movement', icon: 'clipboard-check' },
  { name: 'Packing', detail: 'Bag, arrange and place in cartons', icon: 'package' },
] as const;

export const assemblyInstructions = [
  { name: 'Component positioning', icon: 'locate-fixed', action: 'Place components in their defined slots and locating features.', control: 'Seat the spring firmly and flat; compare its position with the reference sample.', purpose: 'Establishes the starting position for the mechanism.' },
  { name: 'Mechanical fitting', icon: 'layers-2', action: 'Fit the locking part and bring the housing sections together.', control: 'Use the locating slot and align the upper and lower housings before closing.', purpose: 'Supports correct fit and mechanical engagement.' },
  { name: 'Fastening', icon: 'wrench', action: 'Secure the housing with screws in the specified sequence.', control: 'The documented example starts at the locking side, then secures the remaining positions.', purpose: 'Makes the fixing sequence explicit to the operator.' },
  { name: 'Functional assembly', icon: 'move-horizontal', action: 'Lubricate the specified sliding surfaces and fit the internal component.', control: 'Keep product surfaces clean; check retention, locking and movement at inspection.', purpose: 'Connects component fitting to the finished product’s operation.' },
] as const;

export const assemblyControls = [
  { name: 'Correct positioning', text: 'Defined slots and locating features establish where each part belongs.' },
  { name: 'Clean surfaces', text: 'Maintain cleanliness during lubrication and internal assembly.' },
  { name: 'Secure engagement', text: 'Fit the lock correctly and verify that the mechanism holds in position.' },
  { name: 'Proper fastening', text: 'Follow the housing fixing sequence in the work instruction.' },
  { name: 'Specified lubrication', text: 'Apply lubricant where the instruction identifies a moving or sliding surface.' },
  { name: 'Reference sample conformity', text: 'Use the reference sample alongside the written instruction.' },
  { name: 'Smooth operation', text: 'Check opening, closing and retention on the assembled product.' },
] as const;

export const assemblyInspection = [
  { name: 'Appearance', icon: 'scan-eye', items: ['Component color and transparency', 'Visible defects and surface cleanliness', 'Scratches and stress whitening', 'Flash and burrs', 'Printing accuracy and clarity'] },
  { name: 'Assembly', icon: 'component', items: ['Correct component positioning', 'Correct housing fit', 'Secure mechanical locking'] },
  { name: 'Function', icon: 'move-horizontal', items: ['Smooth opening and closing', 'Reliable mechanical engagement', 'Retention of the intended component'] },
  { name: 'Packing', icon: 'package-check', items: ['Clean finished product', 'Bagging to the work instruction', 'Organized placement', 'Neat arrangement in finished-goods cartons'] },
] as const;

export const assemblyOutcomes = [
  { name: 'Cosmetic quality', text: 'Clean handling and appearance checks address marks, contamination and visible defects.' },
  { name: 'Mechanical fit', text: 'Locating features, housing alignment and fastening define how parts come together.' },
  { name: 'Moving performance', text: 'Specified lubrication and functional checks address sliding, opening and locking.' },
  { name: 'Product consistency', text: 'Written steps and a reference sample give operators a common assembly basis.' },
  { name: 'Final presentation', text: 'Print clarity, clean surfaces and orderly handling matter to the finished appearance.' },
  { name: 'Packing readiness', text: 'The process connects inspection with bagging, placement and carton packing.' },
] as const;

export const assemblyFaqs = [
  { question: 'What assembly methods are documented at Xinyinhai?', answer: 'Xinyinhai’s documented assembly and packaging methods support plastic and electronic OEM/ODM project review. These include component positioning, housing and mechanism fitting, manual and automatic screw fastening, hand soldering, specified lubrication, inspection and packing. The component set, connection method and required tests are reviewed against each project’s drawings, specifications and reference samples.' },
  { question: 'How do you control screw torque during assembly?', answer: 'The fastening training includes electric-driver adjustment, torque-checking equipment and torque inspection records. Operators also check fastening condition, including missing or raised screws. The torque requirement, checking method and frequency must be defined for the product and fixing materials; an example machine setting is not a universal assembly specification.' },
  { question: 'Do you support both manual and automatic screw fastening?', answer: 'Yes. The documented methods include handheld electric screwdrivers and automatic screw machines, with single- and dual-workstation configurations. Machine selection depends on screw access, fixture design and product requirements. Setup includes the correct screw, compatible driver bit and suction nozzle, fixture positioning and torque verification.' },
  { question: 'How do you control hand-soldering quality?', answer: 'The training centers on cleanliness, temperature and time. Operators select a suitable tip, verify tip temperature after stabilization, heat the component and pad, control solder feeding and withdrawal, and leave the joint undisturbed during solidification. Visual checks address solder volume, bridging, spikes, poor wetting and wire engagement. Temperature, timing and any electrical or mechanical tests are project-specific.' },
  { question: 'How do you prevent foreign objects from entering finished packages?', answer: 'Packaging awareness materials identify loose screws, metal and solder debris, plastic offcuts, paper and tape, personal contamination, small parts and tools as risks. Screw-machine instructions require feeder and rail clearance and removal of debris. These controls connect with operator self-checks, line inspection and final quality verification. The project packing checklist should define tool control and checks inside the product and package; the objective is risk reduction.' },
  { question: 'How is first-piece and in-process inspection handled?', answer: 'The production boards place setup and first-piece confirmation before operator training and the start of assembly or packing. During operation, self-checks and line patrol checks feed into quality verification. The assembly route includes OQC checks of function and appearance; the packaging route includes BIQC where applicable and final quality sampling. Acceptance criteria and inspection frequency follow the project requirements.' },
  { question: 'How are nonconforming assembly units controlled?', answer: 'The screw-fastening guide requires the affected location to be marked, the unit to be placed in a separate collection container, and the line leader to confirm the issue and arrange handling. The assembly board routes repaired units back through the assembly sequence. Rework requires the relevant checks again before the unit returns to the accepted flow; rejected packing also returns for review and correction.' },
  { question: 'Can assembly instructions be customized for each product?', answer: 'Assembly requirements are reviewed for the specific product: component positions, sequence, fixture, screw type and torque, soldering conditions, functional checks and packing method. The documented SOPs show how work steps and reference samples connect to inspection. Provide drawings, a component list, acceptance criteria and packaging specifications so the project instruction can be defined.' },
  { question: 'How do you control assembly consistency?', answer: 'Work instructions define component locations, housing alignment, fastening sequence, lubrication points and cleanliness requirements. Operators refer to the reference sample as well as the written steps. These instructions connect the assembly sequence to the product’s inspection requirements.' },
  { question: 'Do you perform inspection before packaging?', answer: 'Yes. The documented assembly flow places QC after internal component assembly and before bagging and carton packing. Inspection covers appearance, printing, locking, opening and closing, and retention. Packing instructions then define bagging, organized placement and carton packing.' },
  { question: 'Can assembly and packaging be included in an OEM/ODM project?', answer: 'Yes. Assembly and final packaging can form part of an OEM/ODM manufacturing scope alongside product development and plastic molding. The component set, assembly method, reference sample, acceptance criteria and packing requirements need to be confirmed for the project.' },
  { question: 'How do you control cosmetic defects during assembly?', answer: 'The assembly instructions require clean surfaces during lubrication and internal component fitting. Final inspection checks visible defects, scratches, stress whitening, flash, burrs, color, transparency and printing accuracy and clarity against the applicable requirements and reference sample.' },
  { question: 'How do you verify moving or locking components?', answer: 'The documented inspection checks that the internal assembly locks securely, opens and closes smoothly, and retains the component it is intended to hold. These are product-specific functional checks; the required motion, engagement and retention criteria are defined for each project.' },
  { question: 'Can you manufacture, assemble and pack products in one factory?', answer: 'Xinyinhai’s documented capabilities connect plastic injection molding with assembly, inspection and packing. Whether a complete product can follow that route depends on its materials, components, finishing and test requirements. The manufacturing scope and any external operations are confirmed during project review.' },
] as const;
