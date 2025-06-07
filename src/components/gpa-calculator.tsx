"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { X, Download } from "lucide-react";

type Course = {
  id: number;
  name: string;
  credits: number;
  grade: string;
};

type Semester = {
  name: string; // 'First Semester' or 'Second Semester'
  courses: Course[];
};

type Level = {
  name: string; // '100 Level', '200 Level', etc.
  semesters: Semester[];
};

const gradePoints: { [key: string]: number } = {
  A: 5.0,
  B: 4.0,
  C: 3.0,
  D: 2.0,
  E: 1.0,
  F: 0.0,
};

const LEVELS = [
  '100 Level',
  '200 Level',
  '300 Level',
  '400 Level',
  '500 Level',
];
const SEMESTER_NAMES = ['First Semester', 'Second Semester'];

export default function GPACalculator() {
  const [levels, setLevels] = useState<Level[]>(
    LEVELS.map((level) => ({
      name: level,
      semesters: [
        { name: 'First Semester', courses: [] },
        { name: 'Second Semester', courses: [] },
      ],
    }))
  );
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState("");
  const [grade, setGrade] = useState("");
  const [currentLevel, setCurrentLevel] = useState(0); // index in LEVELS
  const [currentSemester, setCurrentSemester] = useState(0); // 0: First, 1: Second
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const addCourse = () => {
    if (courseName && credits && grade) {
      setLevels((prevLevels) => {
        // Deep copy levels
        const newLevels = prevLevels.map((level, lIdx) => {
          if (lIdx !== currentLevel) return level;
          // Deep copy semesters for the current level
          const newSemesters = level.semesters.map((semester, sIdx) => {
            if (sIdx !== currentSemester) return semester;
            // Deep copy courses for the current semester
            return {
              ...semester,
              courses: [
                ...semester.courses,
                {
                  id: Date.now() + Math.random(),
                  name: courseName,
                  credits: parseFloat(credits),
                  grade,
                },
              ],
            };
          });
          return { ...level, semesters: newSemesters };
        });
        return newLevels;
      });
      setCourseName("");
      setCredits("");
      setGrade("");
    }
  };

  const removeCourse = (levelIdx: number, semesterIdx: number, courseId: number) => {
    setLevels((prevLevels) => {
      const newLevels = [...prevLevels];
      newLevels[levelIdx].semesters[semesterIdx].courses = newLevels[levelIdx].semesters[semesterIdx].courses.filter(
        (course) => course.id !== courseId
      );
      return newLevels;
    });
  };

  const calculateSemesterGPA = (courses: Course[]) => {
    if (courses.length === 0) return 0;
    const totalPoints = courses.reduce(
      (sum, course) => sum + gradePoints[course.grade] * course.credits,
      0
    );
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    return totalPoints / totalCredits;
  };

  const calculateOverallGPA = () => {
    const allCourses = levels.flatMap((level) =>
      level.semesters.flatMap((semester) => semester.courses)
    );
    return calculateSemesterGPA(allCourses);
  };

  const calculateCGPA = () => {
    // For each semester in all levels, calculate GPA if it has courses
    const semesterGPAs = levels
      .flatMap((level) =>
        level.semesters.map((semester) => {
          if (semester.courses.length === 0) return null;
          return calculateSemesterGPA(semester.courses);
        })
      )
      .filter((gpa) => gpa !== null);
    if (semesterGPAs.length === 0) return 0;
    const totalGPA = semesterGPAs.reduce((sum, gpa) => sum + (gpa as number), 0);
    return totalGPA / semesterGPAs.length;
  };

  // Helper to check if any course exists
  const hasAnyCourse = levels.some(level =>
    level.semesters.some(semester => semester.courses.length > 0)
  );

  const downloadGPA = () => {
    // Only include levels/semesters with at least one course
    const filteredLevels = levels
      .map(level => ({
        ...level,
        semesters: level.semesters.filter(semester => semester.courses.length > 0)
      }))
      .filter(level => level.semesters.length > 0);

    const overallGPA = calculateOverallGPA().toFixed(2);
    const cgpa = calculateCGPA().toFixed(2);
    const content =
      `Overall GPA: ${overallGPA}\nCumulative GPA (CGPA): ${cgpa}\n\n` +
      filteredLevels
        .map(
          (level) =>
            `${level.name}\n` +
            level.semesters
              .map(
                (semester) =>
                  `  ${semester.name}\n  GPA: ${calculateSemesterGPA(semester.courses).toFixed(2)}\n` +
                  semester.courses
                    .map(
                      (course) =>
                        `    ${course.name}: ${course.credits} credits, Grade: ${course.grade}`
                    )
                    .join("\n")
              )
              .join("\n\n")
        )
        .join("\n\n");

    if (filteredLevels.length === 0) return; // No courses, do nothing

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gpa_report.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Tabbed UI for levels and semesters
  return (
    <div
      className={`min-h-screen bg-background text-foreground ${
        isDarkMode ? "dark" : ""
      }`}
    >
      <Navbar toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <div className="container mx-auto p-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Student GPA Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Level Tabs */}
            <div className="overflow-x-auto whitespace-nowrap flex gap-2 mb-4 pb-2 border-b">
              {LEVELS.map((level, idx) => (
                <button
                  key={level}
                  className={`px-4 py-2 rounded-t-md font-semibold focus:outline-none transition-colors duration-200 ${
                    currentLevel === idx
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                  onClick={() => setCurrentLevel(idx)}
                  type="button"
                >
                  {level}
                </button>
              ))}
            </div>
            {/* Semester Tabs */}
            <div className="flex space-x-2 mb-4">
              {SEMESTER_NAMES.map((sem, idx) => (
                <button
                  key={sem}
                  className={`px-4 py-2 rounded-t-md border-b-2 font-semibold focus:outline-none transition-colors ${
                    currentSemester === idx
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-primary'
                  }`}
                  onClick={() => setCurrentSemester(idx)}
                >
                  {sem}
                </button>
              ))}
            </div>
            {/* Add Course Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course-name">Course Name</Label>
                  <Input
                    id="course-name"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. Mathematics 101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits/Unit</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    placeholder="e.g. 3"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(gradePoints).map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addCourse} className="w-full">
                Add Course
              </Button>
            </div>
            {/* Courses List for Selected Level & Semester */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-2">{levels[currentLevel].name}</h2>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{levels[currentLevel].semesters[currentSemester].name}</h3>
                {levels[currentLevel].semesters[currentSemester].courses.length > 0 ? (
                  <ul className="space-y-2">
                    {levels[currentLevel].semesters[currentSemester].courses.map((course) => (
                      <li
                        key={course.id}
                        className="flex justify-between items-center bg-secondary p-2 rounded"
                      >
                        <span>
                          {course.name} ({course.credits} credits) - {course.grade}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCourse(currentLevel, currentSemester, course.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No courses added yet.</p>
                )}
                <p className="text-lg font-semibold mt-2">
                  Semester GPA: {calculateSemesterGPA(levels[currentLevel].semesters[currentSemester].courses).toFixed(2)}
                </p>
              </div>
            </div>
            {/* Overall GPA and CGPA */}
            <div className="mt-2">
              {/* <h3 className="text-lg font-semibold">Overall GPA</h3> */}
              {/* <p className="text-3xl font-bold">
                {calculateOverallGPA().toFixed(2)}
              </p> */}
              <h3 className="text-lg font-semibold mt-2">
                Cumulative GPA (C.G.P.A)
              </h3>
              <p className="text-3xl font-bold">{calculateCGPA().toFixed(2)}</p>
              <Button onClick={downloadGPA} className="mt-4" variant="outline" disabled={!hasAnyCourse}>
                <Download className="mr-2 h-4 w-4" /> Download GPA Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
