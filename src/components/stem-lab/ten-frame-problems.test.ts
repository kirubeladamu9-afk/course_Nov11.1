import { describe, expect, it } from 'vitest'
import { checkNumberLine, checkTenFrame, createTenFrameRounds, framesFor, TEN_FRAME_ROUND_PLAN, type TenFrameProblem } from './ten-frame-problems'

const add = (first: number, second: number): TenFrameProblem => ({ operation: 'add', first, second, answer: first + second })
const subtract = (first: number, second: number): TenFrameProblem => ({ operation: 'subtract', first, second, answer: first - second })

describe('ten-frame round generation', () => {
  it('keeps every generated problem inside its round range', () => {
    for (let run = 0; run < 200; run += 1) {
      createTenFrameRounds().forEach(({ problem, ...plan }) => {
        expect(problem.answer).toBe(problem.operation === 'add' ? problem.first + problem.second : problem.first - problem.second)
        expect(problem.answer).toBeGreaterThanOrEqual(0)
        expect(Math.max(problem.first, problem.answer)).toBeLessThanOrEqual(plan.maxTotal)
        expect(problem.first).toBeGreaterThanOrEqual(1)
        expect(problem.second).toBeGreaterThanOrEqual(1)
      })
    }
  })

  it('builds make-ten problems that cross ten and need a second frame', () => {
    for (let run = 0; run < 200; run += 1) {
      const rounds = createTenFrameRounds()
      const makeTen = rounds.find((round) => round.makeTen)
      expect(makeTen).toBeDefined()
      const { problem } = makeTen!
      expect(problem.operation).toBe('add')
      expect(problem.first).toBeLessThan(10)
      expect(problem.first + problem.second).toBeGreaterThan(10)
      expect(problem.second).toBeGreaterThan(10 - problem.first)
      expect(framesFor(problem)).toBe(2)
    }
  })

  it('covers the progression from addition to within-20 problems in order', () => {
    expect(TEN_FRAME_ROUND_PLAN.map((round) => round.label)).toEqual([
      'Addition within 10',
      'Subtraction within 10',
      'Mixed within 10',
      'Predict first · mixed within 10',
      'Mixed within 20',
      'Make ten · addition within 20',
    ])
  })
})

describe('framesFor', () => {
  it('uses one frame up to ten and two frames above ten', () => {
    expect(framesFor(add(4, 6))).toBe(1)
    expect(framesFor(add(7, 5))).toBe(2)
    expect(framesFor(subtract(10, 3))).toBe(1)
    expect(framesFor(subtract(12, 4))).toBe(2)
  })
})

describe('checkTenFrame', () => {
  it('names the addend whose counter count is wrong', () => {
    expect(checkTenFrame(add(7, 5), { firstCounters: 7, secondCounters: 4, removed: 0 }, 12)).toEqual({
      ok: false,
      message: 'You placed 4 counters for the second number, but the problem asks for 5.',
    })
  })

  it('reports the wrong answer against the computed sum', () => {
    expect(checkTenFrame(add(7, 5), { firstCounters: 7, secondCounters: 5, removed: 0 }, 11)).toEqual({
      ok: false,
      message: '7 + 5 is 12, not 11.',
    })
  })

  it('accepts a correct addition and asks for an answer when it is missing', () => {
    expect(checkTenFrame(add(7, 5), { firstCounters: 7, secondCounters: 5, removed: 0 }, 12)).toEqual({ ok: true, message: 'Correct! 7 + 5 = 12.' })
    expect(checkTenFrame(add(7, 5), { firstCounters: 7, secondCounters: 5, removed: 0 }, null).ok).toBe(false)
  })

  it('checks removed counters for subtraction', () => {
    expect(checkTenFrame(subtract(12, 4), { firstCounters: 8, secondCounters: 0, removed: 3 }, 8).message).toBe('You removed 3 counters, but the problem asks you to remove 4.')
    expect(checkTenFrame(subtract(12, 4), { firstCounters: 8, secondCounters: 0, removed: 4 }, 8)).toEqual({ ok: true, message: 'Correct! 12 − 4 = 8.' })
  })
})

describe('checkNumberLine', () => {
  it('requires forward hops for addition and backward hops for subtraction', () => {
    expect(checkNumberLine(add(7, 5), { forward: 3, backward: 0 }, 12).message).toBe('You made 3 forward hops, but the problem asks for 5.')
    expect(checkNumberLine(add(7, 5), { forward: 5, backward: 1 }, 12).ok).toBe(false)
    expect(checkNumberLine(subtract(12, 4), { forward: 0, backward: 4 }, 8)).toEqual({ ok: true, message: 'Correct! 12 − 4 = 8.' })
    expect(checkNumberLine(subtract(12, 4), { forward: 0, backward: 4 }, 7).message).toBe('12 − 4 is 8, not 7.')
  })
})
