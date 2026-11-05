export type BalanceKind = 'build' | 'compare' | 'which-side' | 'make-equal'
export type Side = 'left' | 'right'
export type Relation = '>' | '<' | '='

export type BalancePair = { left: number; right: number }

export type BalanceRoundPlan = {
  label: string
  kind: BalanceKind
  maxValue: number
  equalChance: number
}

export type BalanceRound = BalanceRoundPlan & { pair: BalancePair }

export type BalanceAnswer = { left: number; right: number; relation: Relation | null; heavier: Side | null }

export type BalanceCheck = { ok: boolean; message: string }

const EQUAL_PAIR_CHANCE = 0.2

export const BALANCE_ROUND_PLAN: BalanceRoundPlan[] = [
  { label: 'Build it · within 10', kind: 'build', maxValue: 10, equalChance: 0 },
  { label: 'Compare it · within 10', kind: 'compare', maxValue: 10, equalChance: EQUAL_PAIR_CHANCE },
  { label: 'Which side has more? · within 10', kind: 'which-side', maxValue: 10, equalChance: 0 },
  { label: 'Make it equal · within 10', kind: 'make-equal', maxValue: 10, equalChance: 0 },
  { label: 'Compare it · within 20', kind: 'compare', maxValue: 20, equalChance: EQUAL_PAIR_CHANCE },
  { label: 'Build it · within 20', kind: 'build', maxValue: 20, equalChance: EQUAL_PAIR_CHANCE },
]

const WORDS: Record<Relation, string> = { '>': 'is greater than', '<': 'is less than', '=': 'is equal to' }

const randomInt = (min: number, max: number, random: () => number) => min + Math.floor(random() * (max - min + 1))

const generatePair = (plan: BalanceRoundPlan, random: () => number): BalancePair => {
  if (plan.kind === 'make-equal') {
    const left = randomInt(4, plan.maxValue, random)
    return { left, right: randomInt(1, left - 1, random) }
  }
  if (plan.equalChance > 0 && random() < plan.equalChance) {
    const value = randomInt(1, plan.maxValue, random)
    return { left: value, right: value }
  }
  const left = randomInt(1, plan.maxValue, random)
  const pick = randomInt(1, plan.maxValue - 1, random)
  return { left, right: pick >= left ? pick + 1 : pick }
}

export const createBalanceRounds = (random: () => number = Math.random): BalanceRound[] =>
  BALANCE_ROUND_PLAN.map((plan) => ({ ...plan, pair: generatePair(plan, random) }))

export const relationOf = ({ left, right }: BalancePair): Relation => (left > right ? '>' : left < right ? '<' : '=')

const blocks = (count: number) => `${count} ${count === 1 ? 'block' : 'blocks'}`

const fail = (message: string): BalanceCheck => ({ ok: false, message })

const buildCheck = (pair: BalancePair, answer: BalanceAnswer): BalanceCheck => {
  const problems: string[] = []
  if (answer.left !== pair.left) problems.push(`The left pan has ${blocks(answer.left)}, but the problem asks for ${pair.left}.`)
  if (answer.right !== pair.right) problems.push(`The right pan has ${blocks(answer.right)}, but the problem asks for ${pair.right}.`)
  if (problems.length > 0) return fail(problems.join(' '))
  return { ok: true, message: `Correct. The pans hold ${pair.left} and ${pair.right} blocks.` }
}

const compareCheck = (pair: BalancePair, answer: BalanceAnswer): BalanceCheck => {
  if (answer.relation === null) return fail('Choose >, < or = first.')
  const actual = relationOf(pair)
  const detail = `The left pan has ${blocks(pair.left)} and the right has ${pair.right}. ${pair.left} ${WORDS[actual]} ${pair.right}, so the answer is ${actual}.`
  if (answer.relation !== actual) return fail(`You chose ${answer.relation}. ${detail}`)
  return { ok: true, message: `Correct. ${detail}` }
}

const whichSideCheck = (pair: BalancePair, answer: BalanceAnswer): BalanceCheck => {
  if (answer.heavier === null) return fail('Tap the pan that has more blocks first.')
  const heavier: Side = pair.left > pair.right ? 'left' : 'right'
  const bigger = Math.max(pair.left, pair.right)
  const smaller = Math.min(pair.left, pair.right)
  const detail = `The left pan has ${blocks(pair.left)} and the right has ${pair.right}. ${bigger} is greater than ${smaller}, so the ${heavier} pan has more.`
  if (answer.heavier !== heavier) return fail(`You tapped the ${answer.heavier} pan. ${detail}`)
  return { ok: true, message: `Correct. ${detail}` }
}

const makeEqualCheck = (answer: BalanceAnswer): BalanceCheck => {
  if (answer.right === answer.left) return { ok: true, message: `Balanced. Both pans hold ${blocks(answer.left)}.` }
  if (answer.right < answer.left) {
    return fail(`The left pan has ${blocks(answer.left)} and the right has ${answer.right}. Add ${answer.left - answer.right} more to the right pan.`)
  }
  return fail(`The right pan has ${blocks(answer.right)} and the left has ${answer.left}. Remove ${answer.right - answer.left} from the right pan.`)
}

export const checkBalance = (round: BalanceRound, answer: BalanceAnswer): BalanceCheck => {
  if (round.kind === 'build') return buildCheck(round.pair, answer)
  if (round.kind === 'compare') return compareCheck(round.pair, answer)
  if (round.kind === 'which-side') return whichSideCheck(round.pair, answer)
  return makeEqualCheck(answer)
}
