import { describe, expect, it } from 'vitest'
import { applyTransformation, applyTransformations, createTransformRound, describeRule, type Transformation } from './transform-lab-data'

describe('transform lab geometry', () => {
  it('computes translations and reflections from real coordinates', () => {
    expect(applyTransformation({ x: 2, y: 3 }, { type: 'translation', dx: 3, dy: -2 })).toEqual({ x: 5, y: 1 })
    expect(applyTransformation({ x: 2, y: 3 }, { type: 'reflection', line: 'x-axis', k: 0 })).toEqual({ x: 2, y: -3 })
    expect(applyTransformation({ x: 2, y: 3 }, { type: 'reflection', line: 'y-axis', k: 0 })).toEqual({ x: -2, y: 3 })
    expect(applyTransformation({ x: 2, y: 3 }, { type: 'reflection', line: 'vertical', k: 1 })).toEqual({ x: 0, y: 3 })
  })

  it('computes rotations in both directions and dilation ratios', () => {
    expect(applyTransformation({ x: 2, y: 3 }, { type: 'rotation', angle: 90, direction: 'counterclockwise', center: { x: 0, y: 0 } })).toEqual({ x: -3, y: 2 })
    expect(applyTransformation({ x: 2, y: 3 }, { type: 'rotation', angle: 90, direction: 'clockwise', center: { x: 0, y: 0 } })).toEqual({ x: 3, y: -2 })
    expect(applyTransformation({ x: 2, y: 3 }, { type: 'rotation', angle: 180, direction: 'clockwise', center: { x: 0, y: 0 } })).toEqual({ x: -2, y: -3 })
    expect(applyTransformation({ x: 2, y: 4 }, { type: 'dilation', scale: .5, center: { x: 0, y: 0 } })).toEqual({ x: 1, y: 2 })
  })

  it('applies two transformations in sequence', () => {
    const steps: Transformation[] = [{ type: 'translation', dx: 2, dy: -1 }, { type: 'reflection', line: 'y-axis', k: 0 }]
    expect(applyTransformations([{ x: 1, y: 3 }], steps)).toEqual([{ x: -3, y: 2 }])
  })

  it('generates whole-number shapes and in-grid targets for staged rounds', () => {
    for (let index = 0; index < 12; index += 1) {
      const round = createTransformRound(index)
      const image = applyTransformations(round.original, round.transformations)
      expect([3, 4]).toContain(round.original.length)
      expect(round.original.every(({ x, y }) => Number.isInteger(x) && Number.isInteger(y))).toBe(true)
      expect(image.every(({ x, y }) => x >= -8 && x <= 8 && y >= -8 && y <= 8)).toBe(true)
      expect(round.ruleChoices).toHaveLength(4)
      expect(round.ruleChoices).toContain(describeRule(round.transformations))
    }
  })
})
