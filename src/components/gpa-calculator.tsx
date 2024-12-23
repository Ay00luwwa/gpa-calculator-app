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
  id: number;
  name: string;
  courses: Course[];
};

const gradePoints: { [key: string]: number } = {
  A: 5.0,
  B: 4.0,
  C: 3.0,
  D: 2.0,
  E: 1.0,
  F: 0.0,
};

export default function GPACalculator() {
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: 1, name: "Semester 1", courses: [] },
  ]);
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState("");
  const [grade, setGrade] = useState("");
  const [currentSemester, setCurrentSemester] = useState(1);
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
      setSemesters((prevSemesters) => {
        const newSemesters = [...prevSemesters];
        const semesterIndex = newSemesters.findIndex(
          (sem) => sem.id === currentSemester
        );
        if (semesterIndex !== -1) {
          newSemesters[semesterIndex].courses.push({
            id: Date.now(),
            name: courseName,
            credits: parseFloat(credits),
            grade,
          });
        }
        return newSemesters;
      });
      setCourseName("");
      setCredits("");
      setGrade("");
    }
  };

  const removeCourse = (semesterId: number, courseId: number) => {
    setSemesters((prevSemesters) => {
      const newSemesters = [...prevSemesters];
      const semesterIndex = newSemesters.findIndex(
        (sem) => sem.id === semesterId
      );
      if (semesterIndex !== -1) {
        newSemesters[semesterIndex].courses = newSemesters[
          semesterIndex
        ].courses.filter((course) => course.id !== courseId);
      }
      return newSemesters;
    });
  };

  const calculateSemesterGPA = (courses: Course[]) => {
    if (courses.length === 0) return 0;
    const totalPoints = courses.reduce(
      (sum, course) => sum + gradePoints[course.grade] * course.credits,
      0
    );
    const totalCredits = courses.reduce(
      (sum, course) => sum + course.credits,
      0
    );
    return totalPoints / totalCredits;
  };

  const calculateOverallGPA = () => {
    const allCourses = semesters.flatMap((semester) => semester.courses);
    return calculateSemesterGPA(allCourses);
  };

  const calculateCGPA = () => {
    const semesterGPAs = semesters.map((semester) =>
      calculateSemesterGPA(semester.courses)
    );
    const totalGPA = semesterGPAs.reduce((sum, gpa) => sum + gpa, 0);
    return totalGPA / semesters.length;
  };

  const addSemester = () => {
    setSemesters((prevSemesters) => [
      ...prevSemesters,
      {
        id: prevSemesters.length + 1,
        name: `Semester ${prevSemesters.length + 1}`,
        courses: [],
      },
    ]);
    setCurrentSemester(semesters.length + 1);
  };

  const downloadGPA = () => {
    const overallGPA = calculateOverallGPA().toFixed(2);
    const cgpa = calculateCGPA().toFixed(2);
    const content =
      `Overall GPA: ${overallGPA}\nCumulative GPA (CGPA): ${cgpa}\n\n` +
      semesters
        .map(
          (semester) =>
            `${semester.name}\nGPA: ${calculateSemesterGPA(
              semester.courses
            ).toFixed(2)}\n` +
            semester.courses
              .map(
                (course) =>
                  `${course.name}: ${course.credits} credits, Grade: ${course.grade}`
              )
              .join("\n")
        )
        .join("\n\n");

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
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={currentSemester.toString()}
                  onValueChange={(value) => setCurrentSemester(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem
                        key={semester.id}
                        value={semester.id.toString()}
                      >
                        {semester.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addCourse} className="w-full">
                Add Course
              </Button>
              <Button
                onClick={addSemester}
                variant="outline"
                className="w-full"
              >
                Add New Semester
              </Button>
            </div>

            {semesters.map((semester) => (
              <div key={semester.id} className="mt-8">
                <h3 className="text-lg font-semibold mb-2">{semester.name}</h3>
                {semester.courses.length > 0 ? (
                  <ul className="space-y-2">
                    {semester.courses.map((course) => (
                      <li
                        key={course.id}
                        className="flex justify-between items-center bg-secondary p-2 rounded"
                      >
                        <span>
                          {course.name} ({course.credits} credits) -{" "}
                          {course.grade}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCourse(semester.id, course.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No courses added yet.</p>
                )}
                <p className="mt-2">
                  Semester GPA:{" "}
                  {calculateSemesterGPA(semester.courses).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="mt-8">
              <h3 className="text-lg font-semibold">Overall GPA</h3>
              <p className="text-3xl font-bold">
                {calculateOverallGPA().toFixed(2)}
              </p>
              <h3 className="text-lg font-semibold mt-4">
                Cumulative GPA (CGPA)
              </h3>
              <p className="text-3xl font-bold">{calculateCGPA().toFixed(2)}</p>
              <Button onClick={downloadGPA} className="mt-4" variant="outline">
                <Download className="mr-2 h-4 w-4" /> Download GPA Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
