import { courseData } from "@/lib/course-data";
import { getSnippet } from "@/lib/snippets";
import { CourseExperience } from "@/components/learn/course-experience";

const snippetIds = new Set(
  courseData.modules.flatMap((module) =>
    module.chapters.flatMap((chapter) => chapter.snippetIds),
  ),
);

const snippetMap = Object.fromEntries(
  Array.from(snippetIds).map((id) => [id, getSnippet(id)]),
);

export function CourseMap() {
  return <CourseExperience modules={courseData.modules} snippetMap={snippetMap} />;
}
