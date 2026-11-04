import { type SimulationConfig } from '@/components/admin/admin-data'
import { getStemTool } from './stem-tool-library'

export type StemSubject = 'Math' | 'Physics' | 'Chemistry' | 'Biology'
export type StemGradeBand = 'Grade 1–2' | 'Grade 3–5' | 'Grade 6–8' | 'Grade 9–10' | 'Grade 11–12'
export type StemTool = 'Interactive Diagram' | 'Calculator' | 'Graph' | 'Periodic Table' | 'Chemical Equation' | 'Number Line' | 'Counting Visualizer' | 'Shape Matcher' | 'Drag & Drop' | 'Matching' | 'Fraction Visualizer' | 'Geometry Builder' | 'Pendulum Lab' | 'Neutralization Lab' | 'Osmosis Lab' | 'Projectile Motion Lab'

export interface StemTopic {
  id: string
  subject: StemSubject
  gradeBand: StemGradeBand
  grades: number[]
  difficultyBand: StemGradeBand
  title: string
  overview: string
  tools: StemTool[]
  activitySteps: string[]
  status: 'available' | 'coming-soon'
  simulation?: SimulationConfig
}

export const STEM_GRADE_BANDS: StemGradeBand[] = ['Grade 1–2', 'Grade 3–5', 'Grade 6–8', 'Grade 9–10', 'Grade 11–12']
export const STEM_GRADES = Array.from({ length: 12 }, (_, index) => index + 1)
export const STEM_SUBJECTS: StemSubject[] = ['Math', 'Physics', 'Chemistry', 'Biology']

const slugify = (value: string) => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const activityFor = (title: string) => [`Explore the animated ${title} model`, 'Adjust the variables and interact with the model', 'Explain and check what changed']
type TopicEntry = { title: string; gradeBand: StemGradeBand; grades: number[] }
const entries = (gradeBand: StemGradeBand, titles: string[], gradesByTitle: Record<string, number[]>): TopicEntry[] => titles.map((title) => ({ title, gradeBand, grades: gradesByTitle[title] }))

const catalog: Record<StemSubject, TopicEntry[]> = {
  Math: [
    ...entries('Grade 1–2', ['Counting & Number Recognition', 'Comparing Numbers', 'Addition & Subtraction', 'Place Value', 'Multiplication/Division Concepts', 'Patterns', 'Money', 'Time', 'Measurement', 'Shapes Around Us'], {
      'Counting & Number Recognition': [1], 'Comparing Numbers': [1, 2], 'Addition & Subtraction': [1, 2], 'Place Value': [1, 2], 'Multiplication/Division Concepts': [2], Patterns: [1, 2], Money: [2], Time: [1, 2], Measurement: [1, 2], 'Shapes Around Us': [1, 2],
    }),
    ...entries('Grade 3–5', ['Fractions', 'Decimals', 'Factors & Multiples', 'Ratios', 'Percentages', 'Geometry', 'Angles', 'Perimeter & Area', 'Symmetry', 'Coordinate Grids', 'Data & Statistics', 'Probability'], {
      Fractions: [3, 4, 5], Decimals: [4, 5], 'Factors & Multiples': [4, 5], Ratios: [5], Percentages: [5], Geometry: [3, 4, 5], Angles: [4, 5], 'Perimeter & Area': [4, 5], Symmetry: [4, 5], 'Coordinate Grids': [5], 'Data & Statistics': [3, 4, 5], Probability: [5],
    }),
    ...entries('Grade 6–8', ['Integers', 'Algebra', 'Linear Equations', 'Functions', 'Simultaneous Equations', 'Pythagorean Theorem', 'Transformations', 'Area & Volume'], {
      Integers: [6, 7, 8], Algebra: [7, 8], 'Linear Equations': [6, 7, 8], Functions: [8], 'Simultaneous Equations': [8], 'Pythagorean Theorem': [8], Transformations: [8], 'Area & Volume': [6, 7, 8],
    }),
    ...entries('Grade 9–10', ['Sets', 'Similarity', 'Quadratic Equations', 'Sequences & Series', 'Trigonometry', 'Coordinate Geometry', 'Mathematical Modelling'], {
      Sets: [9], Similarity: [9], 'Quadratic Equations': [10], 'Sequences & Series': [10], Trigonometry: [9, 10], 'Coordinate Geometry': [9, 10], 'Mathematical Modelling': [9, 10],
    }),
    ...entries('Grade 11–12', ['Polynomial Functions', 'Exponential & Logarithmic Functions', 'Analytical Geometry', 'Vectors', 'Limits', 'Differentiation', 'Integration', 'Advanced Algebra'], {
      'Polynomial Functions': [11, 12], 'Exponential & Logarithmic Functions': [11, 12], 'Analytical Geometry': [11, 12], Vectors: [11, 12], Limits: [12], Differentiation: [12], Integration: [12], 'Advanced Algebra': [11, 12],
    }),
  ],
  Physics: [
    ...entries('Grade 1–2', ['Push & Pull', 'Movement', 'Fast & Slow', 'Light & Shadows', 'Sound & Vibrations', 'Heat & Cold', 'Magnets', 'Floating & Sinking'], {
      'Push & Pull': [1, 2], Movement: [1, 2], 'Fast & Slow': [1, 2], 'Light & Shadows': [1, 2], 'Sound & Vibrations': [2], 'Heat & Cold': [2], Magnets: [1], 'Floating & Sinking': [2],
    }),
    ...entries('Grade 3–5', ['Forces & Motion', 'Friction', 'Gravity', 'Reflection', 'Simple Machines', 'Measuring Motion', 'Force', 'Energy', 'Electricity', 'Measurement', 'Motion', 'Work', 'Heat Transfer'], {
      'Forces & Motion': [5, 6], Friction: [5, 6], Gravity: [5, 6], Reflection: [5], 'Simple Machines': [5], 'Measuring Motion': [5], Force: [5, 6], Energy: [5, 6], Electricity: [5, 6], Measurement: [5, 6], Motion: [5, 6], Work: [6], 'Heat Transfer': [5, 6],
    }),
    ...entries('Grade 6–8', ['Pressure', 'Speed & Velocity', 'Refraction'], {
      Pressure: [8], 'Speed & Velocity': [7, 8], Refraction: [8],
    }),
    ...entries('Grade 9–10', ['Vectors & Scalars', 'Linear Motion', 'Newton’s Laws', 'Momentum', 'Gravitation', 'Properties of Matter', 'Waves', 'Kinematics', 'Dynamics', 'Circular Motion', 'Fluid Mechanics', 'Thermal Physics', 'Projectile Motion'], {
      'Vectors & Scalars': [9], 'Linear Motion': [9], 'Newton’s Laws': [9], Momentum: [10], Gravitation: [10], 'Properties of Matter': [9], Waves: [10], Kinematics: [9], Dynamics: [9], 'Circular Motion': [10], 'Fluid Mechanics': [10], 'Thermal Physics': [9, 10], 'Projectile Motion': [10],
    }),
    ...entries('Grade 11–12', ['Oscillations', 'Pendulum Experiment', 'Electrostatics', 'Current Electricity', 'Magnetism', 'Electromagnetic Induction', 'Modern Physics', 'Nuclear Physics', 'Semiconductor Electronics'], {
      Oscillations: [11], 'Pendulum Experiment': [11], Electrostatics: [12], 'Current Electricity': [11, 12], Magnetism: [1, 12], 'Electromagnetic Induction': [12], 'Modern Physics': [12], 'Nuclear Physics': [12], 'Semiconductor Electronics': [12],
    }),
  ],
  Chemistry: [
    ...entries('Grade 1–2', ['Materials Around Us', 'Solids/Liquids/Gases', 'Properties of Materials', 'Dissolving', 'Changes in Materials'], {
      'Materials Around Us': [1], 'Solids/Liquids/Gases': [2], 'Properties of Materials': [1, 2], Dissolving: [2], 'Changes in Materials': [2],
    }),
    ...entries('Grade 3–5', ['Matter', 'States of Matter', 'Solutions', 'Separation Methods', 'Water Chemistry', 'Chemical Safety'], {
      Matter: [5, 6], 'States of Matter': [5, 7], Solutions: [5, 7], 'Separation Methods': [5, 6], 'Water Chemistry': [5], 'Chemical Safety': [5, 7],
    }),
    ...entries('Grade 6–8', ['Atomic Structure', 'Elements & Compounds', 'Chemical Reactions', 'Indicators', 'Metals & Non-Metals', 'Periodic Table', 'Chemical Bonding', 'Chemical Formulae', 'Salts'], {
      'Atomic Structure': [7, 8], 'Elements & Compounds': [7, 8], 'Chemical Reactions': [7, 8], Indicators: [8, 9], 'Metals & Non-Metals': [8], 'Periodic Table': [8, 9], 'Chemical Bonding': [9, 10], 'Chemical Formulae': [9, 10], Salts: [9, 10],
    }),
    ...entries('Grade 9–10', ['Laboratory Techniques & Safety', 'Mole Concept', 'Stoichiometry', 'Acids & Bases', 'Oxidation & Reduction', 'Organic Chemistry'], {
      'Laboratory Techniques & Safety': [9], 'Mole Concept': [10], Stoichiometry: [10], 'Acids & Bases': [9, 10], 'Oxidation & Reduction': [10], 'Organic Chemistry': [10],
    }),
    ...entries('Grade 11–12', ['Chemical Kinetics', 'Chemical Equilibrium', 'Solubility Equilibrium', 'Thermochemistry', 'Electrochemistry', 'Redox Chemistry', 'Hydrocarbons', 'Alcohols & Ethers', 'Aldehydes & Ketones', 'Carboxylic Acids', 'Polymers', 'Biochemistry', 'Environmental Chemistry'], {
      'Chemical Kinetics': [12], 'Chemical Equilibrium': [12], 'Solubility Equilibrium': [12], Thermochemistry: [11], Electrochemistry: [12], 'Redox Chemistry': [11, 12], Hydrocarbons: [11], 'Alcohols & Ethers': [11], 'Aldehydes & Ketones': [12], 'Carboxylic Acids': [12], Polymers: [12], Biochemistry: [12], 'Environmental Chemistry': [12],
    }),
  ],
  Biology: [
    ...entries('Grade 1–2', ['Living & Non-Living Things', 'Parts of Plants', 'Seeds & Germination', 'Animals Around Us', 'Human Body Parts', 'Five Senses', 'Food & Nutrition', 'Healthy Habits', 'Habitats', 'Life Cycles'], {
      'Living & Non-Living Things': [1, 2], 'Parts of Plants': [1, 2], 'Seeds & Germination': [2], 'Animals Around Us': [1, 2], 'Human Body Parts': [1, 2], 'Five Senses': [1], 'Food & Nutrition': [2, 3], 'Healthy Habits': [1, 2], Habitats: [2, 3], 'Life Cycles': [3],
    }),
    ...entries('Grade 3–5', ['Plant Structure', 'Photosynthesis', 'Animal Classification', 'Cells', 'Human Body Systems', 'Ecosystems', 'Food Chains', 'Plant Reproduction', 'Respiration'], {
      'Plant Structure': [3, 4, 5], Photosynthesis: [5, 7], 'Animal Classification': [5, 7], Cells: [5, 7], 'Human Body Systems': [5, 7], Ecosystems: [5, 7], 'Food Chains': [5, 7], 'Plant Reproduction': [5, 7], Respiration: [5, 7],
    }),
    ...entries('Grade 6–8', ['Cell Structure', 'Microscopes', 'Circulation', 'Biodiversity', 'Cell Biology'], {
      'Cell Structure': [7], Microscopes: [7], Circulation: [8], Biodiversity: [8], 'Cell Biology': [7, 8],
    }),
    ...entries('Grade 9–10', ['Biological Molecules', 'Enzymes', 'Cell Division', 'Genetics', 'Plant Physiology', 'Animal Physiology', 'Reproduction', 'Ecology', 'Evolution', 'Osmosis'], {
      'Biological Molecules': [9], Enzymes: [9, 10], 'Cell Division': [10], Genetics: [10], 'Plant Physiology': [10], 'Animal Physiology': [9, 10], Reproduction: [10], Ecology: [9, 10], Evolution: [10], Osmosis: [10],
    }),
    ...entries('Grade 11–12', ['Molecular Biology', 'Microbiology', 'Molecular Genetics', 'DNA & RNA', 'Biotechnology', 'Human Reproduction', 'Immunology', 'Population Biology', 'Conservation Biology'], {
      'Molecular Biology': [11], Microbiology: [12], 'Molecular Genetics': [12], 'DNA & RNA': [11, 12], Biotechnology: [12], 'Human Reproduction': [11], Immunology: [12], 'Population Biology': [12], 'Conservation Biology': [12],
    }),
  ],
}

const subjectTools: Record<StemSubject, StemTool[]> = {
  Math: ['Calculator', 'Graph', 'Geometry Builder'],
  Physics: ['Interactive Diagram', 'Graph', 'Calculator'],
  Chemistry: ['Interactive Diagram', 'Chemical Equation', 'Calculator'],
  Biology: ['Interactive Diagram', 'Graph', 'Drag & Drop'],
}

const makeTopic = (subject: StemSubject, entry: TopicEntry): StemTopic => {
  const { title, gradeBand, grades } = entry
  const tool: StemTool | undefined = subject === 'Physics' && title === 'Pendulum Experiment' ? 'Pendulum Lab' : subject === 'Physics' && title === 'Projectile Motion' ? 'Projectile Motion Lab' : subject === 'Chemistry' && title === 'Acids & Bases' ? 'Neutralization Lab' : subject === 'Biology' && title === 'Osmosis' ? 'Osmosis Lab' : undefined
  const simulation = tool === 'Pendulum Lab' ? getStemTool('pendulum-lab')?.config : tool === 'Projectile Motion Lab' ? getStemTool('projectile-motion-lab')?.config : tool === 'Neutralization Lab' ? getStemTool('neutralization-lab')?.config : tool === 'Osmosis Lab' ? getStemTool('osmosis-lab')?.config : undefined
  const tools = tool ? [tool, ...subjectTools[subject].slice(0, 2)] : subjectTools[subject]
  const overview = subject === 'Physics' && title === 'Forces & Motion' ? 'See how forces cause objects to move.' : subject === 'Physics' && title === 'Friction' ? 'Compare how friction differs across surfaces.' : subject === 'Physics' && title === 'Gravity' ? 'Explore how gravity pulls objects downward.' : subject === 'Physics' && title === 'Reflection' ? 'See how light reflects off mirrors.' : `Build an animated, interactive understanding of ${title.toLowerCase()} through guided exploration and observable results.`
  return {
    id: `${subject.toLowerCase()}-${slugify(title)}`,
    subject,
    gradeBand,
    grades,
    difficultyBand: gradeBand,
    title,
    overview,
    tools,
    activitySteps: activityFor(title),
    status: 'available',
    ...(simulation ? { simulation } : {}),
  }
}

export const STEM_TOPICS: StemTopic[] = STEM_SUBJECTS.flatMap((subject) => catalog[subject].map((entry) => makeTopic(subject, entry)))
export const isStemTopicForGrade = (topic: Pick<StemTopic, 'grades'>, grade: number) => topic.grades.includes(grade)
export const getStemTopicsForGrade = (grade: number) => STEM_TOPICS.filter((topic) => isStemTopicForGrade(topic, grade))
