export type TenFrameOperation = 'add' | 'subtract'

export type TenFrameProblem = {
  operation: TenFrameOperation
  first: number
  second: number
  answer: number
}

export type TenFrameRoundPlan = {
  label: string
  operation: TenFrameOperation | 'mixed'
  maxTotal: number
  makeTen?: boolean
  predictFirst?: boolean
}

export type TenFrameRound = TenFrameRoundPlan & { problem: TenFrameProblem }

export type TenFrameCheck = { ok: boolean; message: string }

export const TEN_FRAME_ROUND_PLAN: TenFrameRoundPlan[] = [
  { label: 'Addition within 10', operation: 'add', maxTotal: 10 },
  { label: 'Subtraction within 10', operation: 'subtract', maxTotal: 10 },
  { label: 'Mixed within 10', operation: 'mixed', maxTotal: 10 },
  { label: 'Predict first · mixed within 10', operation: 'mixed', maxTotal: 10, predictFirst: true },
  { label: 'Mixed within 20', operation: 'mixed', maxTotal: 20 },
  { label: 'Make ten · addition within 20', operation: 'add', maxTotal: 20, makeTen: true },
]

const MINUS = '−'

const randomInt = (min: number, max: number, random: () => number) => min + Math.floor(random() * (max - min + 1))

const generateProblem = (plan: TenFrameRoundPlan, random: () => number): TenFrameProblem => {
  if (plan.makeTen) {
    const first = randomInt(6, 9, random)
    const second = randomInt(11 - first, 9, random)
    return { operation: 'add', first, second, answer: first + second }
  }
  const operation = plan.operation === 'mixed' ? (random() < 0.5 ? 'add' : 'subtract') : plan.operation
  if (operation === 'add') {
    const answer = randomInt(2, plan.maxTotal, random)
    const first = randomInt(1, answer - 1, random)
    return { operation, first, second: answer - first, answer }
  }
  const total = randomInt(2, plan.maxTotal, random)
  const second = randomInt(1, total - 1, random)
  return { operation, first: total, second, answer: total - second }
}

export const createTenFrameRounds = (random: () => number = Math.random): TenFrameRound[] =>
  TEN_FRAME_ROUND_PLAN.map((plan) => ({ ...plan, problem: generateProblem(plan, random) }))

export const framesFor = (problem: TenFrameProblem) => (Math.max(problem.first, problem.answer) > 10 ? 2 : 1)

const fail = (message: string): TenFrameCheck => ({ ok: false, message })

const checkAnswer = (problem: TenFrameProblem, answer: number | null): TenFrameCheck => {
  const symbol = problem.operation === 'add' ? '+' : MINUS
  if (answer === null) return fail('Type your final answer, then check again.')
  if (answer !== problem.answer) return fail(`${problem.first} ${symbol} ${problem.second} is ${problem.answer}, not ${answer}.`)
  return { ok: true, message: `Correct! ${problem.first} ${symbol} ${problem.second} = ${problem.answer}.` }
}

export const checkTenFrame = (
  problem: TenFrameProblem,
  counts: { firstCounters: number; secondCounters: number; removed: number },
  answer: number | null,
): TenFrameCheck => {
  if (problem.operation === 'add') {
    if (counts.firstCounters !== problem.first) return fail(`You placed ${counts.firstCounters} counters for the first number, but the problem asks for ${problem.first}.`)
    if (counts.secondCounters !== problem.second) return fail(`You placed ${counts.secondCounters} counters for the second number, but the problem asks for ${problem.second}.`)
  } else if (counts.removed !== problem.second) {
    return fail(`You removed ${counts.removed} counters, but the problem asks you to remove ${problem.second}.`)
  }
  return checkAnswer(problem, answer)
}

export const checkNumberLine = (
  problem: TenFrameProblem,
  hops: { forward: number; backward: number },
  answer: number | null,
): TenFrameCheck => {
  if (problem.operation === 'add') {
    if (hops.backward > 0) return fail('Addition moves forward. Use only Forward hops.')
    if (hops.forward !== problem.second) return fail(`You made ${hops.forward} forward hops, but the problem asks for ${problem.second}.`)
  } else {
    if (hops.forward > 0) return fail('Subtraction moves backward. Use only Backward hops.')
    if (hops.backward !== problem.second) return fail(`You made ${hops.backward} backward hops, but the problem asks for ${problem.second}.`)
  }
  return checkAnswer(problem, answer)
}
