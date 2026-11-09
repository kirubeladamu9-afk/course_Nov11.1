export type MaterialId = 'aluminum' | 'wood' | 'brick' | 'water'
export type HeatObjectId = 'metal' | 'block' | 'water'
export type TransferType = 'conduction' | 'convection' | 'radiation'
export type MaterialSpec = { id: MaterialId; label: string; conductivity: number; specificHeat: number; color: string; category: 'Conductor' | 'Insulator' }
export type HeatObject = { id: HeatObjectId; label: string; material: MaterialSpec; mass: number; initialTemperature: number }
export type MatchItem = { label: string; material: MaterialSpec; category: MaterialSpec['category'] }
export type HeatRound = { objects: HeatObject[]; matchItems: MatchItem[]; highlightedScene: TransferType; rodTemperatures: number[]; convectionTemperatures: [number, number, number]; radiationTemperature: number }
export type Placement = 'tray' | 'plate' | 'contact'
export type HeatSceneState = { temperatures: Record<HeatObjectId, number>; placements: Record<HeatObjectId, Placement>; contactPair: [HeatObjectId, HeatObjectId]; sourceMode: 'hot' | 'cold'; elapsedSeconds: number; sourceSeconds: Record<HeatObjectId, number> }

export const HOT_SOURCE_TEMPERATURE = 90
export const COLD_SOURCE_TEMPERATURE = 5
export const HEATING_THRESHOLD = 10
const HEAT_TRANSFER_SCALE = .08
const RADIATION_SIGMA = 5.67e-8
const materials: Record<MaterialId, MaterialSpec> = {
  aluminum: { id: 'aluminum', label: 'Aluminum', conductivity: 1, specificHeat: .9, color: '#aebbc5', category: 'Conductor' },
  wood: { id: 'wood', label: 'Wood', conductivity: .18, specificHeat: 1.7, color: '#bd8a50', category: 'Insulator' },
  brick: { id: 'brick', label: 'Brick', conductivity: .3, specificHeat: .84, color: '#bc694f', category: 'Insulator' },
  water: { id: 'water', label: 'Water', conductivity: .12, specificHeat: 4.18, color: '#63a9d5', category: 'Insulator' },
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randomFrom = <T,>(values: T[]) => values[Math.floor(Math.random() * values.length)]
const chooseBlockMaterial = (): MaterialSpec => materials[randomFrom(['wood', 'brick'] as const)]
const initialTemperature = () => randomInt(16, 25)
const roundTo = (value: number, digits = 1) => Number(value.toFixed(digits))

export const createHeatRound = (): HeatRound => {
  const blockMaterial = chooseBlockMaterial()
  const objects: HeatObject[] = [
    { id: 'metal', label: 'Metal block', material: materials.aluminum, mass: .9, initialTemperature: initialTemperature() },
    { id: 'block', label: `${blockMaterial.label} block`, material: blockMaterial, mass: 1, initialTemperature: initialTemperature() },
    { id: 'water', label: 'Beaker of water', material: materials.water, mass: .5, initialTemperature: initialTemperature() },
  ]
  const matchItems: MatchItem[] = [
    { label: 'Metal spoon', material: materials.aluminum, category: materials.aluminum.category },
    { label: 'Wooden spoon', material: materials.wood, category: materials.wood.category },
    { label: 'Brick wall', material: materials.brick, category: materials.brick.category },
    { label: 'Aluminum pan', material: materials.aluminum, category: materials.aluminum.category },
  ].sort(() => Math.random() - .5)
  return {
    objects,
    matchItems,
    highlightedScene: randomFrom(['conduction', 'convection', 'radiation'] as const),
    rodTemperatures: Array.from({ length: 7 }, () => initialTemperature()),
    convectionTemperatures: [initialTemperature(), initialTemperature(), initialTemperature()],
    radiationTemperature: initialTemperature(),
  }
}

export const createHeatSceneState = (round: HeatRound): HeatSceneState => ({
  temperatures: Object.fromEntries(round.objects.map((object) => [object.id, object.initialTemperature])) as Record<HeatObjectId, number>,
  placements: { metal: 'tray', block: 'tray', water: 'tray' },
  contactPair: ['metal', 'block'],
  sourceMode: 'hot',
  elapsedSeconds: 0,
  sourceSeconds: { metal: 0, block: 0, water: 0 },
})

export const materialFor = (id: MaterialId) => materials[id]
export const objectById = (round: HeatRound, id: HeatObjectId) => round.objects.find((object) => object.id === id)!
export const sourceTemperature = (mode: HeatSceneState['sourceMode']) => mode === 'hot' ? HOT_SOURCE_TEMPERATURE : COLD_SOURCE_TEMPERATURE
export const heatDirection = (state: HeatSceneState, first: HeatObjectId, second: HeatObjectId) => {
  const difference = state.temperatures[first] - state.temperatures[second]
  if (Math.abs(difference) < .05) return 'No net flow'
  return difference > 0 ? `${first} → ${second}` : `${second} → ${first}`
}

const contactConductivity = (first: number, second: number) => 2 * first * second / (first + second)
const transferEnergy = (firstTemp: number, secondTemp: number, firstCapacity: number, secondCapacity: number, conductance: number, dt: number) => {
  const difference = firstTemp - secondTemp
  if (Math.abs(difference) < 1e-10) return 0
  const equilibriumEnergy = Math.abs(difference) / (1 / firstCapacity + 1 / secondCapacity)
  return Math.sign(difference) * Math.min(Math.abs(difference) * conductance * dt, equilibriumEnergy)
}

export const advanceHeatScene = (round: HeatRound, state: HeatSceneState, elapsed: number): HeatSceneState => {
  const totalTime = Math.max(0, elapsed)
  const steps = Math.max(1, Math.ceil(totalTime / .05))
  const dt = totalTime / steps
  const temperatures = { ...state.temperatures }
  const sourceSeconds = { ...state.sourceSeconds }
  const plateObjects = round.objects.filter((object) => state.placements[object.id] === 'plate')
  const contactObjects = round.objects.filter((object) => state.placements[object.id] === 'contact')
  const source = sourceTemperature(state.sourceMode)
  for (const object of plateObjects) sourceSeconds[object.id] += totalTime
  for (let step = 0; step < steps; step += 1) {
    for (const object of plateObjects) {
      const capacity = object.mass * object.material.specificHeat
      const conductance = object.material.conductivity * HEAT_TRANSFER_SCALE
      const fraction = 1 - Math.exp(-conductance * dt / capacity)
      temperatures[object.id] += (source - temperatures[object.id]) * fraction
    }
    const changes: Record<HeatObjectId, number> = { metal: 0, block: 0, water: 0 }
    for (let first = 0; first < contactObjects.length; first += 1) {
      for (let second = first + 1; second < contactObjects.length; second += 1) {
        const a = contactObjects[first]
        const b = contactObjects[second]
        const capacityA = a.mass * a.material.specificHeat
        const capacityB = b.mass * b.material.specificHeat
        const conductance = contactConductivity(a.material.conductivity, b.material.conductivity) * HEAT_TRANSFER_SCALE
        const energy = transferEnergy(temperatures[a.id], temperatures[b.id], capacityA, capacityB, conductance, dt)
        changes[a.id] -= energy / capacityA
        changes[b.id] += energy / capacityB
      }
    }
    for (const object of contactObjects) temperatures[object.id] += changes[object.id]
  }
  return { ...state, temperatures, elapsedSeconds: state.elapsedSeconds + totalTime, sourceSeconds }
}

export const timeToChangeBy = (object: HeatObject, source: number, delta = HEATING_THRESHOLD) => {
  const difference = source - object.initialTemperature
  if (Math.abs(difference) <= delta) return Infinity
  const target = object.initialTemperature + Math.sign(difference) * delta
  const fraction = (source - target) / difference
  return -Math.log(fraction) * object.mass * object.material.specificHeat / (object.material.conductivity * HEAT_TRANSFER_SCALE)
}

export const fastestSourceObject = (round: HeatRound, source: number) => round.objects.reduce((fastest, object) => timeToChangeBy(object, source) < timeToChangeBy(fastest, source) ? object : fastest)

export const temperatureOnSourceAfter = (object: HeatObject, seconds: number, source = HOT_SOURCE_TEMPERATURE) => {
  const conductance = object.material.conductivity * HEAT_TRANSFER_SCALE
  const capacity = object.mass * object.material.specificHeat
  return source + (object.initialTemperature - source) * Math.exp(-conductance * Math.max(0, seconds) / capacity)
}

export const advanceConductionRod = (temperatures: number[], elapsed: number, sourceTemperature = HOT_SOURCE_TEMPERATURE) => {
  const steps = Math.max(1, Math.ceil(Math.max(0, elapsed) / .05))
  const dt = Math.max(0, elapsed) / steps
  let current = [...temperatures]
  const conductivity = materials.aluminum.conductivity
  const capacity = .12
  const conductance = conductivity * .12
  for (let step = 0; step < steps; step += 1) {
    current[0] += (sourceTemperature - current[0]) * (1 - Math.exp(-conductance * dt / capacity))
    const changes = Array(current.length).fill(0) as number[]
    for (let index = 0; index < current.length - 1; index += 1) {
      const energy = transferEnergy(current[index], current[index + 1], capacity, capacity, conductance, dt)
      changes[index] -= energy / capacity
      changes[index + 1] += energy / capacity
    }
    current = current.map((temperature, index) => temperature + changes[index])
  }
  return current
}

export const advanceConvection = (temperatures: [number, number, number], elapsed: number, sourceTemperature = HOT_SOURCE_TEMPERATURE) => {
  const steps = Math.max(1, Math.ceil(Math.max(0, elapsed) / .05))
  const dt = Math.max(0, elapsed) / steps
  let current = [...temperatures] as [number, number, number]
  const capacity = 1.4
  const conductance = .035
  for (let step = 0; step < steps; step += 1) {
    current[0] += (sourceTemperature - current[0]) * (1 - Math.exp(-conductance * dt / capacity))
    const circulation = Math.min(Math.abs(current[0] - current[2]) * .18 * dt, Math.abs(current[0] - current[2]) * capacity / 2)
    if (current[0] > current[2]) {
      current[0] -= circulation / capacity
      current[2] += circulation / capacity
    }
    for (let index = 0; index < 2; index += 1) {
      const energy = transferEnergy(current[index], current[index + 1], capacity, capacity, conductance * .25, dt)
      current[index] -= energy / capacity
      current[index + 1] += energy / capacity
    }
  }
  return current
}

export const advanceRadiation = (temperature: number, elapsed: number, sourceKelvin = 1200) => {
  const area = .005
  const viewFactor = .3
  const objectKelvin = temperature + 273.15
  const powerWatts = .9 * RADIATION_SIGMA * area * viewFactor * (sourceKelvin ** 4 - objectKelvin ** 4)
  const capacity = 120
  return temperature + powerWatts / capacity * Math.max(0, elapsed)
}

export const transferTypeDescription: Record<TransferType, string> = {
  conduction: 'Heat travels through touching particles from the warmer end of the metal rod to the cooler end.',
  convection: 'Warm water rises and cool water sinks, carrying heat around the pot.',
  radiation: 'The lamp sends heat across the gap as waves, without touching the object.',
}

export const formatTemperature = (temperature: number) => roundTo(temperature, 1)
