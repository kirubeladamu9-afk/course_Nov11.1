export type FactorPair = { a: number; b: number; id: string }
export type FactorRound = { target: number; stage: string }
export type MultiplesSequence = { number: number; count: number; values: number[]; missingIndexes: number[] }
export type MultipleChoiceRound = { number: number; options: number[]; answers: number[] }

const FACTOR_STAGES = [
  { stage: 'Small numbers', targets: [12, 18] },
  { stage: 'Larger numbers', targets: [36, 48] },
  { stage: 'Prime numbers', targets: [13, 17, 19, 23] },
  { stage: 'Perfect squares', targets: [16, 25, 36, 49] },
] as const
const MULTIPLE_BASES = [3, 4, 5, 6, 7, 8]

const randomItem = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]
const shuffle = <T,>(items: T[]): T[] => [...items].sort(() => Math.random() - .5)

export const createFactorRound = (roundNumber: number, previousTarget?: number): FactorRound => {
  const stage = FACTOR_STAGES[Math.min(Math.floor(roundNumber / 2), FACTOR_STAGES.length - 1)]
  const choices = stage.targets.filter((target) => target !== previousTarget)
  return { stage: stage.stage, target: randomItem(choices.length ? choices : stage.targets) }
}

export const getFactorPairs = (number: number): FactorPair[] => Array.from({ length: Math.floor(Math.sqrt(number)) }, (_, index) => index + 1).filter((factor) => number % factor === 0).map((factor) => ({ a: factor, b: number / factor, id: `${factor}-${number / factor}` }))

export const createMultiplesSequence = (number = randomItem(MULTIPLE_BASES), count = randomItem([5, 6])): MultiplesSequence => {
  const values = Array.from({ length: count }, (_, index) => number * (index + 1))
  const missingIndexes = shuffle(Array.from({ length: count - 1 }, (_, index) => index + 1)).slice(0, 2).sort((a, b) => a - b)
  return { number, count, values, missingIndexes }
}

export const createMultipleChoiceRound = (): MultipleChoiceRound => {
  const number = 6
  const answers = [number, number * 2, number * 3]
  const distractors = [number * 2 + 1, number * 3 + 2]
  return { number, options: shuffle([...answers, ...distractors]), answers }
}
