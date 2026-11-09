import { describe, expect, it } from 'vitest'
import { advanceConductionRod, advanceConvection, advanceHeatScene, advanceRadiation, createHeatRound, createHeatSceneState, fastestSourceObject, formatTemperature, heatDirection, materialFor, sourceTemperature, temperatureOnSourceAfter, timeToChangeBy, type HeatObject, type HeatRound } from './heat-flow-model'

const fixedRound = (): HeatRound => {
  const metal = materialFor('aluminum')
  const wood = materialFor('wood')
  const water = materialFor('water')
  const objects: HeatObject[] = [
    { id: 'metal', label: 'Metal block', material: metal, mass: 1, initialTemperature: 20 },
    { id: 'block', label: 'Wood block', material: wood, mass: 1, initialTemperature: 20 },
    { id: 'water', label: 'Beaker of water', material: water, mass: .5, initialTemperature: 20 },
  ]
  return {
    objects,
    matchItems: [{ label: 'Metal spoon', material: metal, category: 'Conductor' }, { label: 'Wooden spoon', material: wood, category: 'Insulator' }],
    highlightedScene: 'conduction',
    rodTemperatures: Array(7).fill(20),
    convectionTemperatures: [20, 20, 20],
    radiationTemperature: 20,
  }
}

describe('heat transfer model', () => {
  it('uses generated starting temperatures and material choices', () => {
    const round = createHeatRound()
    expect(round.objects.every((object) => object.initialTemperature >= 16 && object.initialTemperature <= 25)).toBe(true)
    expect(['wood', 'brick']).toContain(round.objects.find((object) => object.id === 'block')?.material.id)
    expect(round.objects.find((object) => object.id === 'metal')?.initialTemperature).toBeDefined()
  })

  it('calculates metal heating faster than wood from conductivity and heat capacity', () => {
    const round = fixedRound()
    const metal = round.objects[0]
    const wood = round.objects[1]
    expect(timeToChangeBy(metal, 90)).toBeLessThan(timeToChangeBy(wood, 90))
    expect(temperatureOnSourceAfter(metal, 30)).toBeGreaterThan(temperatureOnSourceAfter(wood, 30))
    expect(fastestSourceObject(round, 90).id).toBe('metal')
    expect(fastestSourceObject(round, 5).id).toBe('metal')
  })

  it('heats or cools objects toward the source temperature', () => {
    const round = fixedRound()
    const state = createHeatSceneState(round)
    const onHotPlate = { ...state, placements: { ...state.placements, metal: 'plate' as const } }
    const heated = advanceHeatScene(round, onHotPlate, 30)
    expect(heated.temperatures.metal).toBeGreaterThan(state.temperatures.metal)
    const coldState = { ...onHotPlate, sourceMode: 'cold' as const }
    const cooled = advanceHeatScene(round, coldState, 30)
    expect(cooled.temperatures.metal).toBeLessThan(state.temperatures.metal)
    expect(sourceTemperature('cold')).toBe(5)
  })

  it('moves heat from the hotter contacting object toward equilibrium', () => {
    const round = fixedRound()
    const state = createHeatSceneState(round)
    const contactState = { ...state, temperatures: { ...state.temperatures, metal: 80, block: 20 }, placements: { ...state.placements, metal: 'contact' as const, block: 'contact' as const } }
    expect(heatDirection(contactState, 'metal', 'block')).toBe('metal → block')
    const next = advanceHeatScene(round, contactState, 300)
    expect(next.temperatures.metal).toBeLessThan(80)
    expect(next.temperatures.block).toBeGreaterThan(20)
    expect(next.temperatures.metal).toBeCloseTo(next.temperatures.block, 0)
    const totalBefore = contactState.temperatures.metal * round.objects[0].mass * round.objects[0].material.specificHeat + contactState.temperatures.block * round.objects[1].mass * round.objects[1].material.specificHeat
    const totalAfter = next.temperatures.metal * round.objects[0].mass * round.objects[0].material.specificHeat + next.temperatures.block * round.objects[1].mass * round.objects[1].material.specificHeat
    expect(totalAfter).toBeCloseTo(totalBefore, 3)
  })

  it('does not transfer heat between objects that are not placed in contact', () => {
    const round = fixedRound()
    const state = createHeatSceneState(round)
    const noContact = { ...state, temperatures: { ...state.temperatures, metal: 80, block: 20 } }
    const next = advanceHeatScene(round, noContact, 20)
    expect(next.temperatures.metal).toBe(80)
    expect(next.temperatures.block).toBe(20)
  })

  it('conducts heat progressively along a metal rod', () => {
    const after = advanceConductionRod(Array(7).fill(20), 20)
    expect(after[0]).toBeGreaterThan(after[1])
    expect(after[1]).toBeGreaterThan(20)
    expect(after[6]).toBeLessThan(after[1])
  })

  it('circulates heat upward through the convection scene', () => {
    const after = advanceConvection([20, 20, 20], 60)
    expect(after[0]).toBeGreaterThan(20)
    expect(after[2]).toBeGreaterThan(20)
    expect(after[2]).toBeGreaterThan(after[1])
  })

  it('transfers radiation across a gap without contact', () => {
    expect(advanceRadiation(20, 30)).toBeGreaterThan(20)
  })

  it('formats thermometer readings to tenths of a degree', () => {
    expect(formatTemperature(21.26)).toBe(21.3)
  })
})
