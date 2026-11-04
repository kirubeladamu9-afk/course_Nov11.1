import { describe, expect, it } from 'vitest'
import { getStemTopicsForGrade, STEM_GRADES, STEM_TOPICS } from './stem-lab-data'

describe('STEM Lab topic grade assignments', () => {
  it('assigns every topic valid grades from 1 through 12', () => {
    expect(STEM_TOPICS.length).toBe(173)
    for (const topic of STEM_TOPICS) {
      expect(topic.grades.length).toBeGreaterThan(0)
      expect(topic.grades.every((grade) => STEM_GRADES.includes(grade))).toBe(true)
    }
  })

  it('includes only topics assigned to the selected grade', () => {
    for (const grade of STEM_GRADES) {
      expect(getStemTopicsForGrade(grade).every((topic) => topic.grades.includes(grade))).toBe(true)
    }
    expect(getStemTopicsForGrade(1).map((topic) => topic.title)).toContain('Counting & Number Recognition')
    expect(getStemTopicsForGrade(2).map((topic) => topic.title)).not.toContain('Counting & Number Recognition')
  })

  it('includes multi-grade topics only in explicitly assigned grades', () => {
    expect(getStemTopicsForGrade(1).map((topic) => topic.title)).toContain('Magnetism')
    expect(getStemTopicsForGrade(12).map((topic) => topic.title)).toContain('Magnetism')
    expect(getStemTopicsForGrade(11).map((topic) => topic.title)).not.toContain('Magnetism')
  })
})
