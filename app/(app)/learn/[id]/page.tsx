import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CourseDetail } from '@/components/learn/course-detail'
import { courses, getCourse } from '@/lib/content/courses'

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return { title: getCourse(id)?.title.en ?? 'Course' }
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = getCourse(id)
  if (!course) notFound()
  return <CourseDetail course={course} />
}
