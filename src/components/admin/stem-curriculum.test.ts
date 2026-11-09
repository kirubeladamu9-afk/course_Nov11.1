import { describe, expect, it } from 'vitest'
import { engineForTopic, getCurriculumTopicKey } from './stem-curriculum'
import { STEM_TOPICS } from '@/components/stem-lab/stem-lab-data'

describe('physics topic engine mappings', () => {
  it('maps Newton’s Laws to the collision engine regardless of apostrophe style', () => {
    expect(engineForTopic('Physics', 'Newton’s Laws')).toBe('collision-playground')
    expect(engineForTopic('Physics', "Newton's Laws")).toBe('collision-playground')
  })

  it('keeps Push & Pull assigned to the Force Playground', () => {
    expect(engineForTopic('Physics', 'Push & Pull')).toBe('force-playground')
  })

  it('does not use Force Playground or its legacy fallback for unrelated physics topics', () => {
    const physicsTopics = STEM_TOPICS.filter((topic) => topic.subject === 'Physics' && topic.title !== 'Push & Pull')
    for (const topic of physicsTopics) {
      expect(engineForTopic('Physics', topic.title)).not.toBe('force-playground')
      expect(engineForTopic('Physics', topic.title)).not.toBe('physics')
    }
  })

  it('matches trimmed topic names and catalog keys consistently', () => {
    expect(engineForTopic('Physics', ' Newton’s Laws ')).toBe('collision-playground')
    expect(getCurriculumTopicKey('Physics', 'Newton’s Laws')).toBe(getCurriculumTopicKey('Physics', "Newton's Laws"))
  })

  it('routes Heat Transfer to Heat Flow Lab and keeps Heat & Cold on its existing activity', () => {
    expect(engineForTopic('Physics', 'Heat Transfer')).toBe('heat-flow-lab')
    expect(engineForTopic('Physics', 'Heat & Cold')).toBe('particle-heat')
  })
})
