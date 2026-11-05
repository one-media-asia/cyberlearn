"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Course = { id?: number; title?: string; name?: string; description?: string; level?: string; category?: string };
type Lab = { id?: string; slug?: string; title?: string; name?: string; description?: string };

const starterCourses: Course[] = [
  { title: "Linux Fundamentals", category: "SYSTEMS", level: "Beginner", description: "Get comfortable with the command line, files and permissions." },
  { title: "Networking Basics", category: "NETWORKING", level: "Beginner", description: "Understand IP addresses, ports, DNS and how networks work." },
  { title: "Web Security Essentials", category: "WEB SECURITY", level: "Beginner", description: "Learn the foundations of safer websites and common web risks." }
];

export default function Home() {
  const [courses, setCourses] = useState<Course[]>(starterCourses);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [apiNote, setApiNote] = useState("Connecting to learning services…");

  useEffect(() => {
    let alive = true;
    fetch("/api/courses").then(r => r.ok ? r.json() : Promise.reject()).then(data => {
      const list = Array.isArray(data) ? data : data.results || data.courses || [];
      if (alive && list.length) setCourses(list);
    }).catch(() => {});
    fetch("/api/labs").then(r => r.ok ? r.json() : Promise.reject()).then(data => {
      const list = Array.isArray(data) ? data : data.labs || data.items || [];
      if (alive) { setLabs(list); setApiNote("Labs service connected"); }
    }).catch(() => { if (alive) setApiNote("Showing the starter dashboard; lab service could not be reached."); });
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => { if (alive) setEmail(data.user?.email || null); });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (alive) setEmail(session?.user?.email || null);
      });
      return () => { alive = false; listener.subscription.unsubscribe(); };
    }
    return () => { alive = false; };
  }, []);

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setEmail(null);
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">C</span> CyberLearn</div>
        <div className="nav-label">LEARN</div>
        <nav>
          <a className="nav-link active" href="#overview">◈ &nbsp; Overview</a>
          <a className="nav-link" href="#courses">▤ &nbsp; Courses</a>
          <a className="nav-link" href="#labs">⌘ &nbsp; Hands-on labs</a>
          <a className="nav-link" href="#resources">↗ &nbsp; Resources</a>
        </nav>
        <div className="nav-label">ACCOUNT</div>
        <Link className="nav-link" href="/login">♙ &nbsp; Sign in / Create account</Link>
      </aside>
      <main className="main" id="overview">
        <div className="topbar">
          <div><div className="eyebrow">YOUR CYBERSECURITY JOURNEY</div><h1>Learn by doing.</h1><div className="subtitle">Build practical security skills, one step at a time.</div></div>
          {email ? <button className="btn" onClick={signOut}>{email} · Sign out</button> : <Link className="btn" href="/login">Sign in</Link>}
        </div>
        <section className="hero">
          <div><div className="eyebrow">WELCOME TO CYBERLEARN</div><h2>Start with the fundamentals.</h2><p>Free, beginner-friendly cybersecurity learning. Explore guided lessons, practise in safe simulations and track your progress as you grow.</p><Link className="btn primary" href="#courses">Explore learning paths&nbsp; →</Link></div>
          <div className="hero-symbol" aria-hidden="true">⌘</div>
        </section>
        <div className="stats">
          <div className="stat"><span>LEARNING PATHS</span><strong>{courses.length}</strong><span>Foundations to explore</span></div>
          <div className="stat"><span>HANDS-ON LABS</span><strong>{labs.length || "—"}</strong><span>Guided practice activities</span></div>
          <div className="stat"><span>YOUR PROGRESS</span><strong>0%</strong><span>Sign in to build your learning record</span></div>
        </div>
        <section id="courses">
          <div className="section-head"><div><h2>Learning paths</h2><div className="subtitle">Build your knowledge from the ground up.</div></div><span className="tag">FREE TO START</span></div>
          <div className="course-grid">
            {courses.map((course, index) => <article className="course" key={course.id || course.title || course.name || index}>
              <span className="tag">{course.category || "FOUNDATIONS"}</span>
              <h3>{course.title || course.name || "Cybersecurity course"}</h3>
              <p>{course.description || "A practical introduction to core cybersecurity concepts."}</p>
              <div className="course-foot"><span>{course.level || "Beginner"}</span><span>Explore path&nbsp; →</span></div>
            </article>)}
          </div>
        </section>
        <section id="labs">
          <div className="section-head"><div><h2>Hands-on labs</h2><div className="subtitle">Practice safely in guided learning simulations.</div></div></div>
          <div className="panel">
            {labs.length ? labs.map((lab, i) => <div className="lab-row" key={lab.id || lab.slug || i}><div><strong>{lab.title || lab.name || "Guided lab"}</strong><p>{lab.description || "A safe, step-by-step practice activity."}</p></div><span className="tag">AVAILABLE</span></div>) : <div className="lab-row"><div><strong>Linux Fundamentals Lab</strong><p>Practise essential terminal concepts in a guided simulation.</p></div><span className="tag">COMING ONLINE</span></div>}
            <p className="notice">{apiNote}. Labs are guided simulations, not unrestricted access to a server.</p>
          </div>
        </section>
        <section id="resources">
          <div className="section-head"><div><h2>Resources</h2><div className="subtitle">Useful references for your next step.</div></div></div>
          <div className="panel"><div className="lab-row"><div><strong>Cybersecurity foundations</strong><p>Start with security principles, terminology and safe practice.</p></div><span>01</span></div><div className="lab-row"><div><strong>Linux and networking</strong><p>Learn the systems that underpin modern security.</p></div><span>02</span></div></div>
        </section>
        <p className="notice">CyberLearn is an educational project. Practise only in authorised environments.</p>
      </main>
    </div>
  );
}
