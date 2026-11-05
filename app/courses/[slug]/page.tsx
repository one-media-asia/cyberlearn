"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const courses: Record<string, { title: string; description: string; lessons: string[] }> = {
  "linux-fundamentals": {
    title: "Linux Fundamentals",
    description: "Get comfortable with the command line, files, directories and permissions.",
    lessons: ["Meet the Linux terminal", "Navigate files and directories", "Read and manage files", "Understand users and permissions", "Review essential Linux security habits"]
  },
  "networking-basics": {
    title: "Networking Basics",
    description: "Understand how devices communicate across networks and the internet.",
    lessons: ["What is a computer network?", "IP addresses and private networks", "Ports and common protocols", "DNS: turning names into addresses", "How to inspect a network safely"]
  },
  "web-security-essentials": {
    title: "Web Security Essentials",
    description: "Learn the foundations of safer websites and common web risks.",
    lessons: ["How websites work", "HTTP and HTTPS", "Authentication and sessions", "Common web security risks", "Safe security testing and responsible disclosure"]
  }
};

export default function CoursePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const course = courses[slug] || {
    title: slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
    description: "A beginner-friendly learning path. Course content will be added as this path is developed.",
    lessons: ["Introduction and learning objectives", "Core concepts", "Practical examples", "Knowledge review"]
  };
  const [completed, setCompleted] = useState<number[]>([]);
  const toggleLesson = (index: number) => setCompleted(current =>
    current.includes(index) ? current.filter(item => item !== index) : [...current, index]
  );
  const progress = Math.round((completed.length / course.lessons.length) * 100);

  return (
    <main className="main course-page">
      <Link className="btn" href="/#courses">← Back to learning paths</Link>
      <div className="eyebrow" style={{ marginTop: 34 }}>CYBERLEARN COURSE</div>
      <h1>{course.title}</h1>
      <p className="subtitle">{course.description}</p>
      <section className="panel" style={{ marginTop: 28 }}>
        <div className="section-head">
          <div><h2>Your learning progress</h2><div className="subtitle">{completed.length} of {course.lessons.length} lessons completed</div></div>
          <span className="tag">{progress}% COMPLETE</span>
        </div>
        <div style={{ height: 8, background: "#20354b", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ width: progress + "%", height: "100%", background: "#42d6c5", transition: "width .2s" }} />
        </div>
      </section>
      <section style={{ marginTop: 30 }}>
        <div className="section-head"><div><h2>Course lessons</h2><div className="subtitle">Work through each lesson at your own pace.</div></div></div>
        <div className="panel">
          {course.lessons.map((lesson, index) => (
            <div className="lab-row" key={lesson}>
              <div>
                <strong>{String(index + 1).padStart(2, "0")} · {lesson}</strong>
                <p>{completed.includes(index) ? "Completed" : "Mark this lesson complete when you finish it."}</p>
              </div>
              <button className={completed.includes(index) ? "btn primary" : "btn"} onClick={() => toggleLesson(index)}>
                {completed.includes(index) ? "Completed ✓" : "Mark complete"}
              </button>
            </div>
          ))}
        </div>
      </section>
      <p className="notice">Your lesson selections are currently held in this page session. Sign-in and permanent progress syncing will be connected in a later step.</p>
    </main>
  );
}
