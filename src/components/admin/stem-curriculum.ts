import { type AdminModule } from './admin-data'
import { type PlatformEngineId } from '@/components/stem-lab/platform-engine-library'

export type MathTier = 'Foundation' | 'Core' | 'Advanced'
export type MathActivityMode = 'count' | 'slider' | 'input' | 'sequence' | 'graph'
export type MathTopic = {
  title: string
  tier: MathTier
  description: string
  activity: string
  activityDescription: string
  mode: MathActivityMode
  target: number
}

const foundation: MathTopic[] = [
  ['Counting & Number Recognition', 'Build quantity recognition and one-to-one counting with playful visuals.', 'Counting Garden', 'Tap animated bugs and fruits that wiggle and pop as they are counted.', 'count', 7],
  ['Comparing Numbers', 'Compare quantities using greater than, less than, and equal to.', 'Number Balance', 'Compare quantities using greater than, less than, and equal to.', 'input', 8],
  ['Addition & Subtraction', 'Solve addition and subtraction by counting and moving along a number path.', 'Ten Frame Builder', 'Solve addition and subtraction by counting and moving along a number path.', 'slider', 6],
  ['Place Value', 'Break numbers into hundreds, tens, and ones using building blocks.', 'Base-10 Builder', 'Stack blocks and regroup them with a satisfying snap animation.', 'input', 342],
  ['Multiplication/Division Concepts', 'See multiplication as equal groups and division as fair sharing.', 'Array Builder', 'Drag critters into rows and columns that light up as groups are counted.', 'input', 3],
  ['Fractions', 'Understand fractions as equal parts of a whole.', 'Fraction Pizza', 'Slice and top a cartoon pizza until the requested fraction is shown.', 'slider', 3],
  ['Decimals', 'Connect decimals to fractions using a visual grid.', 'Decimal Painter', 'Shade squares on a 100-grid like a coloring page.', 'slider', 65],
  ['Ratios', 'Explore how ratios scale using everyday recipes.', 'Recipe Mixer', 'Adjust servings and watch ingredient icons multiply together.', 'slider', 4],
  ['Percentages', 'Connect percentages to fractions and real-world proportions.', '100 Grid Charger', 'Fill a battery-style grid as the percentage increases.', 'slider', 75],
  ['Factors & Multiples', 'Discover number relationships by finding factor pairs.', 'Factor Machine', 'Feed in a number and reveal its factor pairs.', 'input', 24],
  ['Measurement', 'Practice measuring length using real-world objects.', 'Virtual Ruler Quest', 'Practice measuring length using real-world objects.', 'slider', 9],
  ['Geometry', 'Construct and explore basic 2D shapes.', 'Shape Builder Workshop', 'Construct and explore basic 2D shapes.', 'count', 4],
  ['Angles', 'See how angles change from acute to straight.', 'Angle Rotator', "Spin a ray with a slider while a character's arm mimics the angle.", 'slider', 90],
  ['Perimeter & Area', 'Tile a space to understand area and perimeter.', 'Tile the Room', 'Place tiles inside a room and watch its perimeter outline light up.', 'input', 24],
].map(([title, description, activity, activityDescription, mode, target]) => ({ title, tier: 'Foundation', description, activity, activityDescription, mode, target } as MathTopic))

const core: MathTopic[] = [
  ['Symmetry', 'Complete shapes using mirror symmetry.', 'Mirror Drawing', 'Draw the missing half and let a magic mirror reveal whether it matches.', 'count', 5],
  ['Coordinate Grids', 'Plot and move points on a coordinate grid.', 'Coordinate Robot', 'Guide a robot to target coordinates across a grid maze.', 'input', 4],
  ['Data & Statistics', 'Build charts and calculate mean, median, and mode.', 'Build-a-Chart', 'Drag bars upward and watch the chart animate as data is entered.', 'input', 6],
  ['Probability', 'Predict and test outcomes using a virtual random draw.', 'Probability Machine', 'Pull colored balls from a bag while a live graph tracks results.', 'count', 5],
  ['Patterns', 'Identify and extend visual and numeric patterns.', 'Pattern Train', 'Complete a train sequence as shape and number cars roll past.', 'input', 12],
  ['Money', 'Practice counting and making change with virtual currency.', 'Shop Simulator', 'Buy an item and count change with coin and bill animations.', 'input', 7],
  ['Time', 'Read clocks and calculate elapsed time.', 'Clock Quest', "Set a playful clock's hands to match a challenge.", 'slider', 45],
  ['Integers', 'Compare and operate on positive and negative numbers.', 'Elevator Game', 'Move an elevator up and down floors to represent integer operations.', 'slider', -3],
  ['Algebra', 'Solve for unknowns using a visual balance.', 'Balance Equation', 'Remove equal weights from both sides of a scale to isolate x.', 'input', 5],
  ['Linear Equations', 'See how slope and intercept shape a line.', 'Equation ↔ Graph', 'Use sliders for m and b to reshape a line instantly.', 'graph', 2],
  ['Functions', 'Explore how inputs map to outputs.', 'Function Machine', 'Feed numbers into a machine and watch outputs pop out.', 'input', 12],
  ['Simultaneous Equations', 'Find where two equations intersect.', 'Two-Line Intersection', 'Drag two lines until their live intersection point highlights.', 'graph', 3],
  ['Pythagorean Theorem', "Discover the relationship between a right triangle's sides.", 'Triangle Builder', 'Resize a triangle while squares animate to prove a² + b² = c².', 'input', 5],
  ['Sets', 'Explore relationships between groups using Venn diagrams.', 'Set Sorter', 'Drag items into overlapping circles and watch regions light up.', 'count', 4],
].map(([title, description, activity, activityDescription, mode, target]) => ({ title, tier: 'Core', description, activity, activityDescription, mode, target } as MathTopic))

const advanced: MathTopic[] = [
  ['Similarity', 'Compare shapes that share proportions but differ in size.', 'Shape Scaler', 'Resize a shape and see its similar twin scale in real time.', 'slider', 2],
  ['Quadratic Equations', 'See how a, b, and c shape a parabola.', 'Parabola Controller', 'Use sliders to reshape a curve while roots and vertex highlight live.', 'graph', 1],
  ['Sequences & Series', 'Explore patterns in number sequences.', 'Sequence Builder', 'Drag terms into place and watch the pattern animate forward.', 'input', 21],
  ['Trigonometry', 'Connect angles to sine, cosine, and tangent using the unit circle.', 'Unit Circle Spinner', 'Rotate a point around a circle and update sin/cos/tan live.', 'slider', 90],
  ['Coordinate Geometry', 'Calculate distance and midpoints between points.', 'Distance Detective', 'Click two points and reveal their distance with a measuring animation.', 'input', 5],
  ['Mathematical Modelling', 'Apply math to solve real-world scenarios.', 'Scenario Solver', 'Adjust real-world variables and watch outcomes shift.', 'slider', 50],
  ['Polynomial Functions', 'Explore how polynomial terms shape a curve.', 'Curve Sculptor', 'Adjust term sliders and reshape the curve with each change.', 'graph', 2],
  ['Exponential & Logarithmic Functions', 'See rapid growth and its inverse in action.', 'Growth Simulator', 'Watch a population graph grow exponentially as inputs increase.', 'slider', 3],
  ['Analytical Geometry', 'Analyze shapes using coordinate-based equations.', 'Shape Analyzer', 'Manipulate a shape equation and update the graph instantly.', 'graph', 4],
  ['Vectors', 'Combine magnitude and direction visually.', 'Vector Playground', 'Drag arrows, combine vectors, and see the resultant form.', 'slider', 5],
  ['Limits', 'Observe what a function approaches at a point.', 'Approaching Point', 'Creep a marker toward x=2 while its live value updates.', 'slider', 2],
  ['Differentiation', 'See the slope of a curve at any point.', 'Tangent Line Simulator', 'Drag a point along a curve and update its tangent line live.', 'slider', 4],
  ['Integration', 'Approximate area under a curve.', 'Area Under Curve', 'Increase rectangle count and watch the approximation sharpen.', 'slider', 10],
  ['Advanced Algebra', 'Apply advanced algebraic techniques to complex problems.', 'Equation Challenge', 'Solve progressively harder equations with step-by-step hints.', 'input', 42],
].map(([title, description, activity, activityDescription, mode, target]) => ({ title, tier: 'Advanced', description, activity, activityDescription, mode, target } as MathTopic))

export const MATHEMATICS_TOPICS: MathTopic[] = [...foundation, ...core, ...advanced]
export const STEM_CURRICULUM: Record<string, string[]> = {
  Mathematics: MATHEMATICS_TOPICS.map(({ title }) => title),
  Physics: ['Push & Pull', 'Movement', 'Fast & Slow', 'Light & Shadows', 'Sound & Vibrations', 'Heat & Cold', 'Magnets', 'Floating & Sinking', 'Forces & Motion', 'Friction', 'Gravity', 'Reflection', 'Simple Machines', 'Energy', 'Electricity', 'Measurement', 'Speed & Velocity', 'Refraction', 'Vectors & Scalars', "Newton's Laws", 'Momentum', 'Waves', 'Kinematics', 'Electromagnetic Induction', 'Semiconductor Electronics'],
  Chemistry: ['Materials Around Us', 'Solids/Liquids/Gases', 'Properties of Materials', 'Dissolving', 'Changes in Materials', 'Matter', 'States of Matter', 'Solutions', 'Separation Methods', 'Acids & Bases', 'Water Chemistry', 'Chemical Safety', 'Atomic Structure', 'Elements & Compounds', 'Chemical Reactions', 'Indicators', 'Metals & Non-Metals', 'Periodic Table', 'Chemical Bonding', 'Chemical Formulae', 'Salts', 'Laboratory Techniques & Safety', 'Mole Concept', 'Stoichiometry', 'Oxidation & Reduction', 'Organic Chemistry', 'Chemical Kinetics', 'Chemical Equilibrium', 'Solubility Equilibrium', 'Thermochemistry', 'Electrochemistry', 'Redox Chemistry', 'Hydrocarbons', 'Alcohols & Ethers', 'Aldehydes & Ketones', 'Carboxylic Acids', 'Polymers', 'Biochemistry', 'Environmental Chemistry'],
  Biology: ['Living & Non-Living Things', 'Parts of Plants', 'Seeds & Germination', 'Animals Around Us', 'Human Body Parts', 'Five Senses', 'Food & Nutrition', 'Healthy Habits', 'Habitats', 'Plant Structure', 'Photosynthesis', 'Animal Classification', 'Life Cycles', 'Cells', 'Human Body Systems', 'Ecosystems', 'Food Chains', 'Cell Structure', 'Microscopes', 'Plant Reproduction', 'Respiration', 'Circulation', 'Biodiversity', 'Cell Biology', 'Biological Molecules', 'Enzymes', 'Cell Division', 'Genetics', 'Molecular Biology', 'Plant Physiology', 'Animal Physiology', 'Reproduction', 'Microbiology', 'Ecology', 'Evolution', 'Molecular Genetics', 'DNA & RNA', 'Biotechnology', 'Human Reproduction', 'Immunology', 'Population Biology', 'Conservation Biology'],
}

export const getMathTopic = (title: string) => MATHEMATICS_TOPICS.find((topic) => topic.title === title)
const normalizeTopicTitle = (title: string) => title.trim().toLowerCase().replace(/[’‘]/g, "'")
export const getCurriculumTopicKey = (subject: string, title: string) => {
  const index = STEM_CURRICULUM[subject]?.findIndex((topic) => normalizeTopicTitle(topic) === normalizeTopicTitle(title)) ?? -1
  return index < 0 ? undefined : `${subject.toLowerCase()}-${index + 1}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export const getMathTopicForLesson = (moduleTitle: string, curriculumTopic: string | undefined, title: string) => {
  const topicTitle = STEM_CURRICULUM.Mathematics.find((topic) => getCurriculumTopicKey('Mathematics', topic) === curriculumTopic)
  return getMathTopic(topicTitle ?? (moduleTitle === 'Mathematics' ? title : ''))
}

export const engineForTopic = (subject: string, topic: string): PlatformEngineId => {
  const value = topic.trim().toLowerCase().replace(/[’‘]/g, "'")
  if (subject === 'Mathematics') {
    if (/number|addition|subtraction|fraction|integer|counting/.test(value)) return 'number-line'
    if (/geometry|angle|perimeter|area|symmetry|pythagorean|similarity|vector/.test(value)) return 'geometry'
    if (/equation|algebra|polynomial|set/.test(value)) return 'equation-balance'
    if (/data|probability|statistics/.test(value)) return 'data-chart'
    if (/function|graph|coordinate|sequence|trigonometry|limit|differentiation|integration/.test(value)) return 'graph'
    return 'simulation'
  }
  if (subject === 'Physics') {
    if (value === 'push & pull') return 'force-playground'
    if (value === 'movement') return 'motion-track'
    if (value === 'fast & slow') return 'speed-race'
    if (value === 'speed & velocity') return 'speed-calculator-lab'
    if (value === 'light & shadows') return 'shadow-lab'
    if (value === 'sound & vibrations' || value === 'waves') return 'wave-simulator'
    if (value === 'kinematics') return 'kinematics'
    if (value === 'heat & cold') return 'particle-heat'
    if (value === 'linear motion') return 'kinematics'
    if (value === 'gravitation') return 'drop-zone'
    if (value === 'force') return 'force-motion-lab'
    if (value === 'measuring motion' || value === 'motion') return 'motion-track'
    if (value === 'oscillations') return 'wave-simulator'
    if (value === 'thermal physics') return 'particle-state-simulator'
    if (value === 'current electricity') return 'circuit-builder'
    if (value === 'magnetism') return 'magnetic-playground'
    if (value === 'magnets') return 'magnetic-playground'
    if (value === 'floating & sinking') return 'floating-sinking'
    if (value === 'forces & motion') return 'force-motion-lab'
    if (value === 'friction') return 'surface-test'
    if (value === 'gravity') return 'drop-zone'
    if (value === 'reflection') return 'light-ray'
    if (value === 'refraction') return 'light-through-materials'
    if (value === 'vectors & scalars') return 'vector-playground-physics'
    if (value === "newton's laws") return 'collision-playground'
    if (value === 'momentum') return 'momentum-lab'
    if (value === 'simple machines') return 'machine-playground'
    if (value === 'energy') return 'energy-roller-coaster'
    if (value === 'electricity') return 'circuit-builder'
    if (value === 'semiconductor electronics') return 'semiconductor'
    return 'simulation'
  }
  if (subject === 'Chemistry') {
    if (value === 'chemical bonding') return 'chemical-bonding'
    if (value === 'chemical formulae') return 'formula-builder'
    if (value === 'materials around us') return 'material-sorter'
    if (value === 'solids/liquids/gases') return 'state-sorter'
    if (value === 'states of matter') return 'particle-state-simulator'
    if (value === 'dissolving' || value === 'solutions') return 'solution-builder'
    if (value === 'acids & bases') return 'acid-base-lab'
    if (value === 'water chemistry') return 'water-properties-lab'
    if (value === 'atomic structure') return 'atom-builder'
    if (value === 'elements & compounds') return 'element-compound-sorter'
    if (value === 'chemical reactions') return 'reaction-simulator'
    if (value === 'periodic table') return 'periodic-table'
    if (value === 'properties of materials') return 'materials-properties'
    if (/equation|formula|stoichiometry|redox|oxidation/.test(value)) return 'equation-balance'
    return 'simulation'
  }
  if (subject === 'Biology' && value === 'photosynthesis') return 'photosynthesis-lab'
  if (subject === 'Biology' && value === 'cells') return 'cell-zoom'
  if (subject === 'Biology' && value === 'living & non-living things') return 'living-or-not'
  if (subject === 'Biology' && (value === 'plant structure' || value === 'parts of plants')) return 'plant-labeling'
  if (subject === 'Biology' && value === 'human body parts') return 'human-body-parts'
  if (subject === 'Biology' && value === 'five senses') return 'sense-challenge'
  if (subject === 'Biology' && value === 'animals around us') return 'animal-spotter'
  if (subject === 'Biology' && value === 'food & nutrition') return 'healthy-plate'
  if (subject === 'Biology' && ['cell division', 'plant reproduction', 'human reproduction'].includes(value)) return 'simulation'
  if (/microscope|cell/.test(value)) return 'microscope'
  if (/life cycles?|timeline/.test(value)) return 'timeline'
  return 'simulation'
}

export const createStemCurriculumModules = (moduleIdStart: number, lessonIdStart: number): AdminModule[] => {
  let nextLessonId = lessonIdStart
  return Object.entries(STEM_CURRICULUM).map(([subject, topics], moduleIndex) => ({
    id: moduleIdStart + moduleIndex,
    title: subject,
    lessons: topics.map((title) => {
      const platformEngineId = engineForTopic(subject, title)
      return { id: nextLessonId++, title, type: 'simulation' as const, duration: 20, resources: [], simulationToolId: platformEngineId, platformEngineId, curriculumTopic: getCurriculumTopicKey(subject, title) }
    }),
  }))
}
