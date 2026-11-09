import { describe, expect, it } from 'vitest'
import { advanceCart, createCartState, createCoasterTrack, energiesAt, GRAVITY, sampleTrack, scrubCart, zeroKineticLocation } from './energy-roller-coaster-physics'

const runUntilStopped = (track: ReturnType<typeof createCoasterTrack>, friction: number) => {
  let state = createCartState(track)
  for (let step = 0; step < 12000; step += 1) {
    const result = advanceCart(track, state, friction, .05)
    state = result.state
    if (result.stopped) return state
  }
  throw new Error('Cart did not stop')
}

describe('energy roller coaster physics', () => {
  it('draws a sampled smooth curve whose landmark heights match the track', () => {
    const track = createCoasterTrack(15, [8, 12])
    expect(track.points.length).toBeGreaterThan(1000)
    expect(track.landmarks.find(({ label }) => label === 'Hill 2')?.height).toBe(12)
    expect(track.points.every(({ height }) => Number.isFinite(height))).toBe(true)
  })

  it('conserves mechanical energy without friction', () => {
    const track = createCoasterTrack(15, [8, 12])
    for (const fraction of [.1, .35, .6]) {
      const state = scrubCart(track, track.length * fraction, 0)
      const energy = energiesAt(track, state, 50)
      expect(energy.thermal).toBe(0)
      expect(energy.potential + energy.kinetic).toBeCloseTo(50 * GRAVITY * 15, 5)
      expect(energy.speed).toBeCloseTo(Math.sqrt(2 * GRAVITY * (15 - sampleTrack(track, state.s).height)), 5)
    }
  })

  it('turns back below an unreachable second hill', () => {
    const track = createCoasterTrack(10, [7, 13])
    let state = createCartState(track)
    let maximumPosition = 0
    let rolledBack = false
    for (let step = 0; step < 400; step += 1) {
      const previousPosition = state.s
      state = advanceCart(track, state, 0, .05).state
      maximumPosition = Math.max(maximumPosition, state.s)
      if (state.s < previousPosition - .01) rolledBack = true
    }
    expect(rolledBack).toBe(true)
    expect(state.clearedHill2).toBe(false)
    expect(maximumPosition).toBeLessThan(track.hill2S)
    expect(state.maxHeight).toBeLessThan(13)
  })

  it('converts mechanical energy into thermal energy with friction', () => {
    const track = createCoasterTrack(15, [8, 12])
    const state = runUntilStopped(track, .2)
    const energy = energiesAt(track, state, 50)
    expect(state.thermalPerKg).toBeGreaterThan(0)
    expect(energy.potential + energy.kinetic + energy.thermal).toBeCloseTo(energy.total, 5)
  })

  it('computes the first turning-point prediction from the generated track', () => {
    const track = createCoasterTrack(15, [8, 12])
    expect(zeroKineticLocation(track, 0)).toContain('At the start and near')
    expect(zeroKineticLocation(track, .1)).toContain('At the start and near')
  })

  it('scales energy with mass while keeping speed independent of mass', () => {
    const track = createCoasterTrack(15, [8, 12])
    const state = scrubCart(track, track.hill1S, 0)
    const light = energiesAt(track, state, 50)
    const heavy = energiesAt(track, state, 100)
    expect(heavy.potential).toBeCloseTo(light.potential * 2)
    expect(heavy.kinetic).toBeCloseTo(light.kinetic * 2)
    expect(heavy.speed).toBeCloseTo(light.speed)
  })
})
