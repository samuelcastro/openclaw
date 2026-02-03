export type CourseQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type CoursePrinciple = {
  title: string;
  summary: string;
  takeaways: string[];
};

export type CourseChapter = {
  id: string;
  title: string;
  summary: string;
  snippetIds: string[];
  principle: CoursePrinciple;
  quiz: CourseQuizQuestion[];
};

export type CourseModule = {
  id: string;
  title: string;
  level: "intro" | "core" | "advanced";
  badge: { id: string; title: string; points: number };
  chapters: CourseChapter[];
};

export type CourseData = {
  modules: CourseModule[];
};
