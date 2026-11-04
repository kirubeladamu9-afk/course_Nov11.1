import { describe, expect, it } from 'vitest'
import { engineForTopic } from './stem-curriculum'

describe('physics topic engine mappings', () => {
  it('maps Newton’s Laws to the collision engine regardless of apostrophe style', () => {
    expect(engineForTopic('Physics', 'Newton’s Laws')).toBe('collision-playground')
    expect(engineForTopic('Physics', "Newton's Laws")).toBe('collision-playground')
  })

  it('keeps Push & Pull assigned to the Force Playground', () => {
    expect(engineForTopic('Physics', 'Push & Pull')).toBe('force-playground')
  })
})
