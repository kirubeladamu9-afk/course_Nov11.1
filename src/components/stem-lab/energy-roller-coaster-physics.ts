export type TrackPoint = { x: number; height: number; slope: number; s: number }
export type Track = { points: TrackPoint[]; length: number; hill1S: number; hill2S: number; landmarks: { label: string; s: number; height: number }[]; startHeight: number; hill1Height: number; hill2Height: number }
export type CartState = { s: number; velocity: number; thermalPerKg: number; maxHeight: number; clearedHill2: boolean }
export type StepResult = { state: CartState; stopped: boolean; clearedHill2: boolean }
export type Energies = { potential: number; kinetic: number; thermal: number; total: number; speed: number }

export const GRAVITY = 9.81
const TRACK_X = [0, 3, 8, 13, 17, 21, 25, 29, 34, 37, 40, 42]

const monotoneSlopes = (heights: number[]) => heights.map((height, index) => {
  if (index === 0) return (heights[1] - height) / (TRACK_X[1] - TRACK_X[0])
  if (index === heights.length - 1) return (height - heights[index - 1]) / (TRACK_X[index] - TRACK_X[index - 1])
  const before = (height - heights[index - 1]) / (TRACK_X[index] - TRACK_X[index - 1])
  const after = (heights[index + 1] - height) / (TRACK_X[index + 1] - TRACK_X[index])
  if (before * after <= 0) return 0
  const widthBefore = TRACK_X[index] - TRACK_X[index - 1]
  const widthAfter = TRACK_X[index + 1] - TRACK_X[index]
  return (widthBefore + widthAfter) / (widthBefore / before + widthAfter / after)
})

const sampleCurve = (x: number, heights: number[], slopes: number[]) => {
  let index = TRACK_X.length - 2
  for (let current = 0; current < TRACK_X.length - 1; current += 1) {
    if (x <= TRACK_X[current + 1]) { index = current; break }
  }
  const x0 = TRACK_X[index]
  const x1 = TRACK_X[index + 1]
  const width = x1 - x0
  const t = (x - x0) / width
  const t2 = t * t
  const t3 = t2 * t
  const h0 = heights[index]
  const h1 = heights[index + 1]
  const m0 = slopes[index]
  const m1 = slopes[index + 1]
  const height = (2 * t3 - 3 * t2 + 1) * h0 + (t3 - 2 * t2 + t) * width * m0 + (-2 * t3 + 3 * t2) * h1 + (t3 - t2) * width * m1
  const slope = ((6 * t2 - 6 * t) * h0 + (-6 * t2 + 6 * t) * h1) / width + (3 * t2 - 4 * t + 1) * m0 + (3 * t2 - 2 * t) * m1
  return { height, slope }
}

export const createCoasterTrack = (startHeight: number, hills: [number, number]): Track => {
  const [hill1Height, hill2Height] = hills
  const heights = [startHeight, startHeight - 1.5, 4, 2, 3, hill1Height, 3, 1, hill2Height, 4, 2, 22]
  const slopes = monotoneSlopes(heights)
  const points: TrackPoint[] = []
  let distance = 0
  let previous: { x: number; height: number } | null = null
  const sampleCount = 1680
  for (let index = 0; index <= sampleCount; index += 1) {
    const x = TRACK_X[TRACK_X.length - 1] * index / sampleCount
    const { height, slope } = sampleCurve(x, heights, slopes)
    if (previous) distance += Math.hypot(x - previous.x, height - previous.height)
    points.push({ x, height, slope, s: distance })
    previous = { x, height }
  }
  const atX = (x: number) => points[Math.round(x / TRACK_X[TRACK_X.length - 1] * sampleCount)]
  return {
    points,
    length: distance,
    hill1S: atX(TRACK_X[5]).s,
    hill2S: atX(TRACK_X[8]).s,
    landmarks: [
      { label: 'Hill 1', s: atX(TRACK_X[5]).s, height: hill1Height },
      { label: 'Valley 1', s: atX(TRACK_X[3]).s, height: 2 },
      { label: 'Valley 2', s: atX(TRACK_X[7]).s, height: 1 },
      { label: 'Hill 2', s: atX(TRACK_X[8]).s, height: hill2Height },
      { label: 'Valley 3', s: atX(TRACK_X[10]).s, height: 2 },
      { label: 'End rise', s: atX(TRACK_X[11]).s, height: 22 },
    ],
    startHeight,
    hill1Height,
    hill2Height,
  }
}

export const sampleTrack = (track: Track, s: number): TrackPoint => {
  const target = Math.max(0, Math.min(track.length, s))
  let low = 0
  let high = track.points.length - 1
  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    if (track.points[middle].s < target) low = middle + 1
    else high = middle
  }
  const right = track.points[low]
  const left = track.points[Math.max(0, low - 1)]
  const span = right.s - left.s
  const fraction = span === 0 ? 0 : (target - left.s) / span
  return { x: left.x + (right.x - left.x) * fraction, height: left.height + (right.height - left.height) * fraction, slope: left.slope + (right.slope - left.slope) * fraction, s: target }
}

const normalAcceleration = (slope: number) => GRAVITY / Math.sqrt(1 + slope * slope)
const gravityAlongTrack = (slope: number) => -GRAVITY * slope / Math.sqrt(1 + slope * slope)

export const createCartState = (track: Track): CartState => ({ s: 0, velocity: 0, thermalPerKg: 0, maxHeight: track.startHeight, clearedHill2: false })

export const energiesAt = (track: Track, state: CartState, mass: number): Energies => {
  const { height } = sampleTrack(track, state.s)
  const potential = mass * GRAVITY * height
  const total = mass * GRAVITY * track.startHeight
  const thermal = Math.min(total, Math.max(0, state.thermalPerKg * mass))
  const kinetic = Math.max(0, total - potential - thermal)
  return { potential, kinetic, thermal, total, speed: Math.sqrt(2 * kinetic / mass) }
}

const availablePerKgAt = (track: Track, s: number, thermalPerKg: number) => GRAVITY * (track.startHeight - sampleTrack(track, s).height) - thermalPerKg

export const advanceCart = (track: Track, state: CartState, friction: number, elapsed: number): StepResult => {
  const duration = Math.min(.05, Math.max(0, elapsed))
  const steps = Math.max(1, Math.ceil(duration / (1 / 120)))
  const dt = duration / steps
  let current = state
  let stopped = false
  let clearedHill2 = state.clearedHill2
  const coefficient = Math.max(0, Math.min(.2, friction))
  for (let index = 0; index < steps; index += 1) {
    const point = sampleTrack(track, current.s)
    const alongGravity = gravityAlongTrack(point.slope)
    const normal = normalAcceleration(point.slope)
    const direction = Math.abs(current.velocity) > .0001 ? Math.sign(current.velocity) : Math.sign(alongGravity)
    if (direction === 0 || Math.abs(alongGravity) <= coefficient * normal && Math.abs(current.velocity) <= .0001) {
      current = { ...current, velocity: 0 }
      stopped = true
      break
    }
    const acceleration = alongGravity - coefficient * normal * direction
    const nextVelocityEstimate = current.velocity + acceleration * dt
    const deltaS = current.velocity * dt + .5 * acceleration * dt * dt
    if (Math.abs(deltaS) < 1e-10) {
      current = { ...current, velocity: 0 }
      stopped = true
      break
    }
    const nextS = Math.max(0, Math.min(track.length, current.s + deltaS))
    const thermalPerKg = current.thermalPerKg + coefficient * normal * Math.abs(nextS - current.s)
    let resultingS = nextS
    let resultingThermal = thermalPerKg
    if (availablePerKgAt(track, nextS, thermalPerKg) < 0) {
      let low = 0
      let high = 1
      for (let search = 0; search < 20; search += 1) {
        const fraction = (low + high) / 2
        const middle = current.s + (nextS - current.s) * fraction
        const thermalAtMiddle = current.thermalPerKg + coefficient * normal * Math.abs(middle - current.s)
        if (availablePerKgAt(track, middle, thermalAtMiddle) >= 0) low = fraction
        else high = fraction
      }
      resultingS = current.s + (nextS - current.s) * ((low + high) / 2)
      resultingThermal = current.thermalPerKg + coefficient * normal * Math.abs(resultingS - current.s)
    }
    if (direction > 0 && current.s < track.hill2S && resultingS >= track.hill2S) clearedHill2 = true
    const resultPoint = sampleTrack(track, resultingS)
    const remainingEnergy = Math.max(0, availablePerKgAt(track, resultingS, resultingThermal))
    const speed = Math.sqrt(2 * remainingEnergy)
    const velocityDirection = resultingS === 0 || resultingS === track.length || remainingEnergy < 1e-7 ? 0 : Math.sign(nextVelocityEstimate || deltaS)
    current = { s: resultingS, velocity: velocityDirection * speed, thermalPerKg: resultingThermal, maxHeight: Math.max(current.maxHeight, resultPoint.height), clearedHill2 }
    if (resultingS === 0 || resultingS === track.length) {
      current = { ...current, velocity: 0 }
      stopped = true
      break
    }
  }
  return { state: current, stopped, clearedHill2 }
}

export const fastestLandmark = (track: Track, friction: number) => {
  const coefficient = Math.max(0, Math.min(.2, friction))
  let thermalPerKg = 0
  let fastestPoint = track.points[0]
  let fastestSpeedSquared = 0
  let previous = track.points[0]
  for (const point of track.points.slice(1)) {
    thermalPerKg += coefficient * normalAcceleration(previous.slope) * (point.s - previous.s)
    const speedSquared = 2 * (GRAVITY * (track.startHeight - point.height) - thermalPerKg)
    if (speedSquared < 0) break
    if (speedSquared > fastestSpeedSquared) {
      fastestSpeedSquared = speedSquared
      fastestPoint = point
    }
    previous = point
  }
  const landmark = track.landmarks.reduce((closest, current) => Math.abs(current.s - fastestPoint.s) < Math.abs(closest.s - fastestPoint.s) ? current : closest)
  return landmark.label
}

export const zeroKineticLocation = (track: Track, friction: number) => {
  const coefficient = Math.max(0, Math.min(.2, friction))
  let thermalPerKg = 0
  let previous = track.points[0]
  let previousAvailable = 0
  for (const point of track.points.slice(1)) {
    thermalPerKg += coefficient * normalAcceleration(previous.slope) * (point.s - previous.s)
    const available = availablePerKgAt(track, point.s, thermalPerKg)
    if (available <= 0) {
      const fraction = previousAvailable / (previousAvailable - available)
      const turningS = previous.s + (point.s - previous.s) * fraction
      const nearest = track.landmarks.reduce((closest, landmark) => Math.abs(landmark.s - turningS) < Math.abs(closest.s - turningS) ? landmark : closest)
      return `At the start and near ${nearest.label}`
    }
    previous = point
    previousAvailable = available
  }
  return 'At the start and at the track end'
}

export const scrubCart = (track: Track, s: number, friction: number): CartState => {
  let position = Math.max(0, Math.min(track.length, s))
  let thermalPerKg = 0
  let previous = track.points[0]
  const coefficient = Math.max(0, Math.min(.2, friction))
  for (const point of track.points.slice(1)) {
    if (point.s > position) break
    const segmentThermal = thermalPerKg + coefficient * normalAcceleration(previous.slope) * (point.s - previous.s)
    if (availablePerKgAt(track, point.s, segmentThermal) < 0) {
      let low = 0
      let high = 1
      for (let search = 0; search < 20; search += 1) {
        const fraction = (low + high) / 2
        const candidateS = previous.s + (point.s - previous.s) * fraction
        const candidateThermal = thermalPerKg + coefficient * normalAcceleration(previous.slope) * (candidateS - previous.s)
        if (availablePerKgAt(track, candidateS, candidateThermal) >= 0) low = fraction
        else high = fraction
      }
      position = previous.s + (point.s - previous.s) * ((low + high) / 2)
      thermalPerKg += coefficient * normalAcceleration(previous.slope) * (position - previous.s)
      break
    }
    thermalPerKg = segmentThermal
    previous = point
  }
  if (position === s) {
    const sample = sampleTrack(track, position)
    const available = Math.max(0, availablePerKgAt(track, position, thermalPerKg))
    return { s: position, velocity: Math.sqrt(2 * available), thermalPerKg, maxHeight: sample.height, clearedHill2: false }
  }
  const sample = sampleTrack(track, position)
  return { s: position, velocity: 0, thermalPerKg, maxHeight: sample.height, clearedHill2: false }
}
