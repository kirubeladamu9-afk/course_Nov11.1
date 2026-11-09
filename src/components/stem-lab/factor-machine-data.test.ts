import { describe, expect, it } from 'vitest'
import { createFactorRound, createMultipleChoiceRound, createMultiplesSequence, getFactorPairs } from './factor-machine-data'

describe('factor machine data', () => {
  it('generates targets in the intended progression', () => {
    expect([createFactorRound(0).target, createFactorRound(1).target].every((target) => [12, 18].includes(target))).toBe(true)
    expect([createFactorRound(2).target, createFactorRound(3).target].every((target) => [36, 48].includes(target))).toBe(true)
    expect([createFactorRound(4).target, createFactorRound(5).target].every((target) => [13, 17, 19, 23].includes(target))).toBe(true)
    expect([createFactorRound(6).target, createFactorRound(7).target].every((target) => [16, 25, 36, 49].includes(target))).toBe(true)
  })

  it('returns each factor pair once, including one pair for a prime or square pair', () => {
    expect(getFactorPairs(24).map(({ a, b }) => [a, b])).toEqual([[1, 24], [2, 12], [3, 8], [4, 6]])
    expect(getFactorPairs(13).map(({ a, b }) => [a, b])).toEqual([[1, 13]])
    expect(getFactorPairs(16).map(({ a, b }) => [a, b])).toEqual([[1, 16], [2, 8], [4, 4]])
  })

  it('builds skip-counting sequences with two missing entries', () => {
    const sequence = createMultiplesSequence(6, 6)
    expect(sequence.values).toEqual([6, 12, 18, 24, 30, 36])
    expect(sequence.missingIndexes).toHaveLength(2)
    expect(sequence.missingIndexes.every((index) => index > 0 && index < 6)).toBe(true)
  })

  it('generates the identify round using multiples of six', () => {
    const round = createMultipleChoiceRound()
    expect(round.number).toBe(6)
    expect(round.answers.every((answer) => answer % 6 === 0)).toBe(true)
    expect(round.options).toHaveLength(5)
    expect(round.answers.every((answer) => round.options.includes(answer))).toBe(true)
  })
})
