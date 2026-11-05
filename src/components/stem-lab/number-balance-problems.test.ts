import { describe, expect, it } from 'vitest'
import { BALANCE_ROUND_PLAN, checkBalance, createBalanceRounds, relationOf, type BalanceKind, type BalanceRound } from './number-balance-problems'

const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

const compare: BalanceRound = { label: 'Compare it', kind: 'compare', maxValue: 10, equalChance: 0, pair: { left: 4, right: 7 } }
const build: BalanceRound = { label: 'Build it', kind: 'build', maxValue: 10, equalChance: 0, pair: { left: 4, right: 7 } }
const whichSide: BalanceRound = { label: 'Which side', kind: 'which-side', maxValue: 10, equalChance: 0, pair: { left: 4, right: 7 } }
const makeEqual: BalanceRound = { label: 'Make equal', kind: 'make-equal', maxValue: 10, equalChance: 0, pair: { left: 7, right: 5 } }

const answer = (overrides: Partial<{ left: number; right: number; relation: '>' | '<' | '=' | null; heavier: 'left' | 'right' | null }>) => ({
  left: 4,
  right: 7,
  relation: null,
  heavier: null,
  ...overrides,
})

describe('number balance round generation', () => {
  it('follows the progression order and ranges', () => {
    expect(BALANCE_ROUND_PLAN.map((plan) => plan.kind)).toEqual<BalanceKind[]>(['build', 'compare', 'which-side', 'make-equal', 'compare', 'build'])
    expect(BALANCE_ROUND_PLAN.map((plan) => plan.maxValue)).toEqual([10, 10, 10, 10, 20, 20])
  })

  it('keeps every block count inside its round range', () => {
    for (let run = 1; run <= 300; run += 1) {
      createBalanceRounds(seeded(run)).forEach(({ pair, maxValue }) => {
        expect(Number.isInteger(pair.left) && Number.isInteger(pair.right)).toBe(true)
        expect(pair.left).toBeGreaterThanOrEqual(1)
        expect(pair.right).toBeGreaterThanOrEqual(1)
        expect(pair.left).toBeLessThanOrEqual(maxValue)
        expect(pair.right).toBeLessThanOrEqual(maxValue)
      })
    }
  })

  it('never makes equal pairs in which-side or make-equal rounds', () => {
    for (let run = 1; run <= 300; run += 1) {
      createBalanceRounds(seeded(run)).forEach(({ kind, pair }) => {
        if (kind === 'which-side' || kind === 'make-equal') expect(pair.left).not.toBe(pair.right)
      })
    }
  })

  it('makes make-equal rounds start with the left pan heavier', () => {
    for (let run = 1; run <= 300; run += 1) {
      createBalanceRounds(seeded(run)).forEach(({ kind, pair }) => {
        if (kind === 'make-equal') expect(pair.left).toBeGreaterThan(pair.right)
      })
    }
  })

  it('includes equal pairs in about one eligible round in five', () => {
    let eligible = 0
    let equal = 0
    for (let run = 1; run <= 2000; run += 1) {
      createBalanceRounds(seeded(run)).forEach(({ equalChance, pair }) => {
        if (equalChance === 0) return
        eligible += 1
        if (pair.left === pair.right) equal += 1
      })
    }
    expect(equal / eligible).toBeGreaterThan(0.15)
    expect(equal / eligible).toBeLessThan(0.25)
  })
})

describe('number balance checks', () => {
  it('reads the relation from the real counts', () => {
    expect(relationOf({ left: 4, right: 7 })).toBe('<')
    expect(relationOf({ left: 7, right: 4 })).toBe('>')
    expect(relationOf({ left: 6, right: 6 })).toBe('=')
  })

  it('explains a wrong comparison symbol with the counts', () => {
    expect(checkBalance(compare, answer({ relation: '>' }))).toEqual({
      ok: false,
      message: 'You chose >. The left pan has 4 blocks and the right has 7. 4 is less than 7, so the answer is <.',
    })
  })

  it('accepts the correct comparison symbol, including equal pairs', () => {
    expect(checkBalance(compare, answer({ relation: '<' })).ok).toBe(true)
    const equal: BalanceRound = { ...compare, pair: { left: 6, right: 6 } }
    expect(checkBalance(equal, answer({ left: 6, right: 6, relation: '=' })).ok).toBe(true)
  })

  it('asks for a symbol before checking a comparison', () => {
    expect(checkBalance(compare, answer({})).message).toBe('Choose >, < or = first.')
  })

  it('reports the exact block count that is off when building', () => {
    expect(checkBalance(build, answer({ left: 3 }))).toEqual({ ok: false, message: 'The left pan has 3 blocks, but the problem asks for 4.' })
    expect(checkBalance(build, answer({ left: 3, right: 5 })).message).toBe(
      'The left pan has 3 blocks, but the problem asks for 4. The right pan has 5 blocks, but the problem asks for 7.',
    )
  })

  it('accepts a build when both pans match the numbers', () => {
    expect(checkBalance(build, answer({})).ok).toBe(true)
  })

  it('checks which pan the student tapped', () => {
    expect(checkBalance(whichSide, answer({})).message).toBe('Tap the pan that has more blocks first.')
    expect(checkBalance(whichSide, answer({ heavier: 'left' }))).toEqual({
      ok: false,
      message: 'You tapped the left pan. The left pan has 4 blocks and the right has 7. 7 is greater than 4, so the right pan has more.',
    })
    expect(checkBalance(whichSide, answer({ heavier: 'right' })).ok).toBe(true)
  })

  it('says how many blocks to add or remove in make-equal rounds', () => {
    expect(checkBalance(makeEqual, answer({ left: 7, right: 5 }))).toEqual({
      ok: false,
      message: 'The left pan has 7 blocks and the right has 5. Add 2 more to the right pan.',
    })
    expect(checkBalance(makeEqual, answer({ left: 7, right: 9 })).message).toBe(
      'The right pan has 9 blocks and the left has 7. Remove 2 from the right pan.',
    )
    expect(checkBalance(makeEqual, answer({ left: 7, right: 7 })).ok).toBe(true)
  })
})
