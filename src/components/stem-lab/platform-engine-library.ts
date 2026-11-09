export type PlatformEngineId =
  | 'material-sorter'
  | 'state-sorter'
  | 'particle-state-simulator'
  | 'solution-builder'
  | 'acid-base-lab'
  | 'water-properties-lab'
  | 'atom-builder'
  | 'element-compound-sorter'
  | 'reaction-simulator'
  | 'periodic-table'
  | 'materials-properties'
  | 'formula-builder'
  | 'drag-drop'
  | 'living-or-not'
  | 'plant-labeling'
  | 'photosynthesis-lab'
  | 'cell-zoom'
  | 'human-body-parts'
  | 'sense-challenge'
  | 'animal-spotter'
  | 'healthy-plate'
  | 'matching'
  | 'number-line'
  | 'graph'
  | 'geometry'
  | 'equation-balance'
  | 'simulation'
  | 'physics'
  | 'force-playground'
  | 'machine-playground'
  | 'energy-roller-coaster'
  | 'heat-flow-lab'
  | 'circuit-builder'
  | 'force-motion-lab'
  | 'surface-test'
  | 'drop-zone'
  | 'light-ray'
  | 'light-through-materials'
  | 'vector-playground-physics'
  | 'collision-playground'
  | 'momentum-lab'
  | 'motion-track'
  | 'speed-race'
  | 'speed-calculator-lab'
  | 'shadow-lab'
  | 'wave-simulator'
  | 'kinematics'
  | 'projectile-motion'
  | 'semiconductor'
  | 'particle-heat'
  | 'magnetic-playground'
  | 'floating-sinking'
  | 'virtual-lab'
  | 'molecule-atom'
  | 'chemical-bonding'
  | 'biology-explorer'
  | 'microscope'
  | 'timeline'
  | 'data-chart'
  | 'prediction-experiment'

export type PlatformEngineDefinition = {
  id: PlatformEngineId
  name: string
  description: string
  subjects: string[]
  examples: string[]
  interaction: string
}

export const PLATFORM_ENGINES: PlatformEngineDefinition[] = [
  { id: 'drag-drop', name: 'Drag & Drop', description: 'Sort, classify, and place objects into meaningful categories.', subjects: ['Math', 'Chemistry', 'Biology'], examples: ['Living vs non-living', 'Habitats', 'Base-10 blocks'], interaction: 'Drag objects into validated drop zones.' },
  { id: 'living-or-not', name: 'Living or Not?', description: 'Sort everyday objects into living and non-living groups.', subjects: ['Biology'], examples: ['Trees and rocks', 'Seeds and batteries', 'Everyday objects'], interaction: 'Drag or tap objects into validated living and non-living bins.' },
  { id: 'plant-labeling', name: 'Label the Plant', description: "Explore how a plant's structure supports its function.", subjects: ['Biology'], examples: ['Plant structures', 'Functions of roots and leaves', 'Flowering plants'], interaction: 'Drag or tap labels onto the correct plant structures.' },
  { id: 'human-body-parts', name: 'Label the Body', description: 'Identify major parts of the human body.', subjects: ['Biology'], examples: ['Body regions', 'Muscles and movement', 'Human anatomy'], interaction: 'Drag or tap labels onto the numbered body pointers.' },
  { id: 'sense-challenge', name: 'Sense Challenge', description: 'Match situations to the sense used to experience them.', subjects: ['Biology'], examples: ['Sight', 'Hearing', 'Smell, touch, and taste'], interaction: 'Tap the sense that matches each everyday situation.' },
  { id: 'animal-spotter', name: 'Animal Spotter', description: 'Recognize and group common animals.', subjects: ['Biology'], examples: ['Farm animals', 'Pets', 'Animals in outdoor scenes'], interaction: 'Tap hidden animals to find them and hear their sounds.' },
  { id: 'healthy-plate', name: 'Build a Healthy Plate', description: 'Build a balanced, healthy meal.', subjects: ['Biology'], examples: ['Food groups', 'Balanced meals', 'Healthy choices'], interaction: 'Tap foods, sort their groups, judge balance, and apply the idea.' },
  { id: 'matching', name: 'Matching', description: 'Connect related terms, symbols, structures, and definitions.', subjects: ['Math', 'Chemistry', 'Biology'], examples: ['Shapes and features', 'DNA base pairs', 'Element and symbol'], interaction: 'Select one item from each column to form a pair.' },
  { id: 'number-line', name: 'Interactive Number Line', description: 'Place values and visualize movement for arithmetic and integers.', subjects: ['Math'], examples: ['Addition and subtraction', 'Fractions', 'Comparing numbers'], interaction: 'Drag a marker to a target value on a scaled line.' },
  { id: 'graph', name: 'Graph Builder', description: 'Manipulate parameters and see equations, data, and motion update live.', subjects: ['Math', 'Physics'], examples: ['Linear equations', 'Quadratics', 'Motion graphs'], interaction: 'Change controls and inspect the rendered curve.' },
  { id: 'geometry', name: 'Geometry Manipulator', description: 'Construct shapes while measurements update from draggable vertices.', subjects: ['Math'], examples: ['Area and perimeter', 'Angles', 'Pythagorean theorem'], interaction: 'Drag vertices and observe geometric calculations.' },
  { id: 'equation-balance', name: 'Equation / Balance', description: 'Solve algebraic and chemical equations by keeping both sides equivalent.', subjects: ['Math', 'Chemistry'], examples: ['x + 3 = 7', 'Chemical equations', 'Stoichiometry'], interaction: 'Adjust both sides until the configured equality is satisfied.' },
  { id: 'simulation', name: 'Simulation', description: 'Change inputs, run a rule, and explain the resulting value.', subjects: ['Math', 'Physics', 'Chemistry', 'Biology'], examples: ['Population growth', 'Dissolving', 'Photosynthesis'], interaction: 'Manipulate variables and run a calculated model.' },
  { id: 'physics', name: 'Physics Playground', description: 'Legacy physics activity engine for older lessons.', subjects: ['Physics'], examples: ['Legacy physics lessons'], interaction: 'Use a configured physics activity.' },
  { id: 'force-playground', name: 'Force Playground', description: 'Explore how pushing and pulling move objects.', subjects: ['Physics'], examples: ['Pushing everyday objects', 'Comparing weight', 'Heavy and light objects'], interaction: 'Drag objects across a surface and identify which needs the biggest push.' },
  { id: 'machine-playground', name: 'Machine Playground', description: 'Explore the mechanical advantage of a lever.', subjects: ['Physics'], examples: ['Adjusting a fulcrum', 'Balancing torque', 'Comparing effort distance'], interaction: 'Change the fulcrum and use calculated force and distance to move a heavy box.' },
  { id: 'energy-roller-coaster', name: 'Energy Roller Coaster', description: 'Explore how potential and kinetic energy transform on a roller coaster.', subjects: ['Physics'], examples: ['Potential energy', 'Kinetic energy', 'Conservation of energy'], interaction: 'Release a cart and observe calculated energy changes as it climbs and descends hills.' },
  { id: 'heat-flow-lab', name: 'Heat Flow Lab', description: 'Explore how heat moves between objects.', subjects: ['Physics'], examples: ['Conduction', 'Convection', 'Radiation'], interaction: 'Move objects onto a heat source or into contact and observe temperatures change from a live heat-transfer model.' },
  { id: 'circuit-builder', name: 'Circuit Builder', description: 'Build a working circuit.', subjects: ['Physics'], examples: ['Battery terminals', 'Closed loops', 'Switches and bulbs'], interaction: 'Connect component terminals and close the switch to light the bulb.' },
  { id: 'force-motion-lab', name: 'Force & Motion Lab', description: 'See how forces cause objects to move.', subjects: ['Physics'], examples: ['Applied force', 'Acceleration', 'Speed'], interaction: 'Apply a measured force and observe a cart accelerate across a surface.' },
  { id: 'surface-test', name: 'Surface Test', description: 'Compare how friction differs across surfaces.', subjects: ['Physics'], examples: ['Ice', 'Wood', 'Sandpaper'], interaction: 'Apply the same push and compare how friction changes the block\'s motion.' },
  { id: 'drop-zone', name: 'Drop Zone', description: 'Explore how gravity pulls objects downward.', subjects: ['Physics'], examples: ['Gravity', 'Air resistance', 'Falling objects'], interaction: 'Drop objects and compare equal gravity acceleration with feather air resistance.' },
  { id: 'light-ray', name: 'Light Ray Simulator', description: 'See how light reflects off mirrors.', subjects: ['Physics'], examples: ['Reflection', 'Mirror angle', 'Law of reflection'], interaction: 'Rotate a mirror and observe the incoming and reflected ray update live.' },
  { id: 'light-through-materials', name: 'Light Through Materials', description: 'See how light bends through different materials.', subjects: ['Physics'], examples: ['Snell’s law', 'Air, water, and glass', 'Angles of refraction'], interaction: 'Adjust an incident ray and compare its computed bend across material boundaries.' },
  { id: 'vector-playground-physics', name: 'Vector Playground', description: 'Explore the difference between vectors and scalars.', subjects: ['Physics'], examples: ['Vector components', 'Resultants', 'Scalars and vectors'], interaction: 'Drag vector tips, combine components, and inspect the computed resultant.' },
  { id: 'collision-playground', name: 'Collision Playground', description: 'Explore how force, mass, and motion relate.', subjects: ['Physics'], examples: ['Newton’s second law', 'Mass and acceleration', 'Net force'], interaction: 'Balance teams, choose a mass, and simulate how net force changes motion.' },
  { id: 'momentum-lab', name: 'Momentum Lab', description: 'Explore how momentum transfers in collisions.', subjects: ['Physics'], examples: ['Momentum conservation', 'Elastic collisions', 'Mass and velocity'], interaction: 'Set mass, velocity, and elasticity, then observe a calculated two-ball collision.' },
  { id: 'motion-track', name: 'Motion Track', description: 'Explore different types of movement.', subjects: ['Physics'], examples: ['Position', 'Speed', 'Movement types'], interaction: 'Control a car and inspect its live motion.' },
  { id: 'speed-race', name: 'Speed Race', description: 'Compare the speeds of moving objects.', subjects: ['Physics'], examples: ['Racing characters', 'Speed comparisons', 'Prediction'], interaction: 'Predict and observe which racer is faster.' },
  { id: 'speed-calculator-lab', name: 'Speed Calculator Lab', description: 'Calculate and compare speed and velocity.', subjects: ['Physics'], examples: ['Distance and time', 'Speed calculations', 'Direction and velocity'], interaction: 'Adjust distance and time, then validate the calculated speed and direction.' },
  { id: 'shadow-lab', name: 'Shadow Lab', description: 'See how light creates shadows.', subjects: ['Physics'], examples: ['Light position', 'Shadow size', 'Shadow direction'], interaction: 'Move a lamp, object, and screen to change a computed shadow.' },
  { id: 'wave-simulator', name: 'Wave Machine', description: 'Explore how amplitude and frequency shape a wave.', subjects: ['Physics'], examples: ['Point-mass string', 'Wavelength', 'Reflection'], interaction: 'Adjust tension, damping, frequency, and end conditions to model a real wave.' },
  { id: 'kinematics', name: 'Kinematics Lab', description: 'Analyze motion using position, velocity, and acceleration.', subjects: ['Physics'], examples: ['Position-time graphs', 'Velocity', 'Acceleration'], interaction: 'Move an object and compare its measured motion with kinematic equations.' },
  { id: 'projectile-motion', name: 'Projectile Motion Lab', description: 'Adjust launch conditions and calculate the horizontal range of a projectile.', subjects: ['Physics'], examples: ['Launch angle', 'Range', 'Air resistance'], interaction: 'Fire a projectile and compare its measured trajectory with physics equations.' },
  { id: 'semiconductor', name: 'Semiconductor Lab', description: 'Explore how semiconductor devices control current.', subjects: ['Physics'], examples: ['Diode I–V curves', 'Forward bias', 'Current flow'], interaction: 'Adjust voltage and inspect a modeled diode current response.' },
  { id: 'particle-heat', name: 'Particle Heat Simulator', description: 'See how heat affects particle movement.', subjects: ['Physics'], examples: ['Temperature', 'Particle motion', 'Heating and cooling'], interaction: 'Adjust temperature and observe particles move faster or slower.' },
  { id: 'magnetic-playground', name: 'Magnetic Playground', description: 'Explore how magnets attract and repel.', subjects: ['Physics'], examples: ['Magnetic poles', 'Attraction', 'Repulsion'], interaction: 'Drag magnets together and observe their magnetic interaction.' },
  { id: 'floating-sinking', name: 'Buoyancy Simulator', description: 'Discover why some objects float and others sink.', subjects: ['Physics'], examples: ['Water', 'Objects', 'Density'], interaction: 'Adjust mass and volume, then compare density with water as the object floats or sinks.' },
  { id: 'virtual-lab', name: 'Virtual Lab', description: 'Follow a safe, observable procedure with materials, measurements, and results.', subjects: ['Chemistry', 'Biology'], examples: ['Acids and bases', 'Mixing materials', 'Osmosis'], interaction: 'Set up, run, observe, and validate an experiment.' },
  { id: 'molecule-atom', name: 'Molecule / Atom Builder', description: 'Construct atoms and molecule structures from connected parts.', subjects: ['Chemistry'], examples: ['Atomic structure', 'Chemical bonding', 'Organic molecules'], interaction: 'Place particles or atoms and validate the target structure.' },
  { id: 'chemical-bonding', name: 'Chemical Bonding Simulator', description: 'Explore covalent, ionic, and metallic bonding with live electron and energy models.', subjects: ['Chemistry'], examples: ['VSEPR geometry', 'Bond energy', 'Polarity and ions'], interaction: 'Select elements, test bonds, and inspect a physically inspired molecular model.' },
  { id: 'biology-explorer', name: 'Biology Explorer', description: 'Explore labeled structures and reveal connected biological processes.', subjects: ['Biology'], examples: ['Plant parts', 'Cell organelles', 'Human body systems'], interaction: 'Select hotspots to reveal explanations and relationships.' },
  { id: 'photosynthesis-lab', name: 'Photosynthesis Lab', description: 'See how plants make their own food using sunlight.', subjects: ['Biology'], examples: ['Sunlight', 'Water and carbon dioxide', 'Glucose and oxygen', 'Limiting factors'], interaction: 'Change inputs, calculate the limiting factor, and validate a live photosynthesis challenge.' },
  { id: 'cell-zoom', name: 'Cell Zoom', description: 'Discover that living things are made of tiny building blocks called cells.', subjects: ['Biology'], examples: ['Animal cell', 'Nucleus', 'Cell membrane', 'Mitochondria'], interaction: 'Drag randomized structure labels to aligned pointers on a simplified animal cell diagram.' },
  { id: 'microscope', name: 'Virtual Microscope', description: 'Zoom into specimens and identify structures at increasing magnification.', subjects: ['Biology'], examples: ['Plant cells', 'Animal cells', 'Specimens'], interaction: 'Adjust magnification and inspect labeled structures.' },
  { id: 'timeline', name: 'Timeline / Lifecycle', description: 'Arrange stages and reason about sequence, change, and cause.', subjects: ['Biology', 'Physics'], examples: ['Life cycles', 'Mitosis', 'Historical processes'], interaction: 'Reorder stages and validate the sequence.' },
  { id: 'data-chart', name: 'Data / Chart Builder', description: 'Build charts from values and calculate statistics from the same data.', subjects: ['Math', 'Physics', 'Biology'], examples: ['Mean and median', 'Experimental probability', 'Population data'], interaction: 'Adjust values and read the live visualization.' },
  { id: 'prediction-experiment', name: 'Prediction → Experiment → Result', description: 'Wrap any engine in a prediction, test, observation, and explanation flow.', subjects: ['Math', 'Physics', 'Chemistry', 'Biology'], examples: ['Predict projectile range', 'Predict pH', 'Predict population change'], interaction: 'Choose a prediction, run the embedded engine, and compare outcomes.' },
  { id: 'material-sorter', name: 'Material Sorter', description: 'Explore the everyday materials that make up our world.', subjects: ['Chemistry'], examples: ['Wood, metal, plastic, and glass', 'Everyday objects', 'Material classification'], interaction: 'Drag or tap objects into their matching material bins.' },
  { id: 'state-sorter', name: 'State Sorter', description: 'Explore the three states of matter.', subjects: ['Chemistry'], examples: ['Solids, liquids, and gases', 'Particle behavior', 'Room-temperature substances'], interaction: 'Drag substances into simulated particle containers.' },
  { id: 'particle-state-simulator', name: 'Particle State Simulator', description: 'Heat and cool water to observe real particle phase changes.', subjects: ['Chemistry', 'Physics'], examples: ['Melting and freezing', 'Boiling and condensation', 'Particle motion'], interaction: 'Drag the temperature slider and validate a target state.' },
  { id: 'solution-builder', name: 'Solution Builder', description: 'Explore how solutes dissolve into solvents.', subjects: ['Chemistry'], examples: ['Solutes and solvents', 'Dissolving particles', 'Saturation'], interaction: 'Add a solute, stir the water, and validate a dissolving prediction.' },
  { id: 'acid-base-lab', name: 'Acid-Base Lab', description: 'Explore how acids and bases react together.', subjects: ['Chemistry'], examples: ['pH and indicators', 'Neutralization', 'Acid-base reactions'], interaction: 'Mix samples, read the live pH, and adjust the neutralization.' },
  { id: 'water-properties-lab', name: 'Water Properties Lab', description: 'Explore the properties and behavior of water.', subjects: ['Chemistry'], examples: ['Surface tension', 'Solvent ability', 'Cohesion'], interaction: 'Test water with objects, solutes, and droplets.' },
  { id: 'atom-builder', name: 'Atom Builder', description: 'Build an atom from protons, neutrons, and electrons.', subjects: ['Chemistry'], examples: ['Atomic number', 'Isotopes and ions', 'Electron shells'], interaction: 'Drag particles into the nucleus and electron shells.' },
  { id: 'element-compound-sorter', name: 'Element / Compound Sorter', description: 'Explore the difference between elements and compounds.', subjects: ['Chemistry'], examples: ['Elements and compounds', 'Chemical formulas', 'Atom composition'], interaction: 'Sort real substances by their atom composition.' },
  { id: 'reaction-simulator', name: 'Reaction Simulator', description: 'Mix substances and observe a reaction.', subjects: ['Chemistry'], examples: ['Balanced equations', 'Limiting reagents', 'Products and leftovers'], interaction: 'Add reactants in stoichiometric ratios and observe products.' },
  { id: 'periodic-table', name: 'Periodic Table Explorer', description: 'Explore real element data, electron shells, categories, and uses.', subjects: ['Chemistry'], examples: ['Atomic number', 'Element categories', 'Electron shells'], interaction: 'Search, filter, inspect, and identify elements.' },
  { id: 'materials-properties', name: 'Property Tester + Mixing Lab', description: "Compare materials by their physical properties, and explore what happens when they're mixed.", subjects: ['Chemistry'], examples: ['Flexibility, hardness, and shininess', 'Dissolving and mixtures', 'Layer separation'], interaction: 'Test material properties, then combine substances and predict the outcome.' },
  { id: 'formula-builder', name: 'Formula Builder', description: 'Assemble the correct chemical formula from elements.', subjects: ['Chemistry'], examples: ['H₂O', 'CO₂', 'CH₄', 'NaCl'], interaction: 'Build common molecules from draggable atom spheres and validate their composition.' },
]

export const getPlatformEngine = (id: PlatformEngineId) => PLATFORM_ENGINES.find((engine) => engine.id === id)

export const engineForStemTool: Record<string, PlatformEngineId> = {
  'Drag & Drop': 'drag-drop',
  Matching: 'matching',
  'Shape Matcher': 'matching',
  'Counting Visualizer': 'drag-drop',
  'Fraction Visualizer': 'number-line',
  'Number Line': 'number-line',
  Graph: 'graph',
  'Geometry Builder': 'geometry',
  'Chemical Equation': 'equation-balance',
  Calculator: 'simulation',
  'Interactive Diagram': 'biology-explorer',
  'Periodic Table': 'periodic-table',
  'Pendulum Lab': 'physics',
  'Projectile Motion Lab': 'physics',
  'Neutralization Lab': 'virtual-lab',
  'Osmosis Lab': 'virtual-lab',
}
