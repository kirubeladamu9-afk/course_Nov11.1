import { describe, expect, it } from 'vitest'
import { toPublicCoursePreview } from './public-course-preview.js'

describe('toPublicCoursePreview', () => {
  it('keeps curriculum metadata and excludes lesson materials and answer data', () => {
    const course = {
      id: 7,
      title: 'Course title',
      status: 'Published',
      category: 'Science',
      level: 'Beginner',
      tutor: 'Instructor',
      students: 12,
      price: 20,
      cover: '/cover.png',
      rating: 4.5,
      ratingCount: 2,
      description: 'Short description',
      longDescription: 'Full description',
      learningOutcomes: ['Outcome'],
      requirements: ['Requirement'],
      certificate: true,
      updatedAt: 'Today',
      modules: [{
        id: 3,
        title: 'Module',
        privateModuleField: 'hidden',
        lessons: [{
          id: 9,
          title: 'Lesson',
          type: 'video',
          duration: 60,
          estimatedDuration: 90,
          videoUrl: 'https://example.com/private-video.mp4',
          articleBody: 'Private lesson text',
          resources: [{ id: 1, name: 'Worksheet', url: 'https://example.com/private.pdf' }],
          quizQuestions: [{ question: 'Question', correctOption: 1 }],
        }],
      }],
    }

    const preview = toPublicCoursePreview(course)

    expect(preview.modules[0]).toEqual({
      id: 3,
      title: 'Module',
      lessons: [{ id: 9, title: 'Lesson', type: 'video', duration: 60, estimatedDuration: 90, resources: [], resourceCount: 1 }],
    })
    expect(JSON.stringify(preview)).not.toContain('private-video')
    expect(JSON.stringify(preview)).not.toContain('Private lesson text')
    expect(JSON.stringify(preview)).not.toContain('private.pdf')
    expect(JSON.stringify(preview)).not.toContain('correctOption')
  })
})
