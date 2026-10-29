import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  FileText,
  FolderKanban,
  GraduationCap,
  Lightbulb,
  LoaderCircle,
  Sparkles,
  Target,
  ThumbsUp,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react"
import { getMyResumes, analyzeResume, getLatestAnalysis } from "../services/api"

// Update these paths to match the routes in App.jsx
const ROUTES = {
  upload: "/resume-upload",
  aiAnalyzer: "/resume-analyzer",
  jobs: "/job-matches",
}

const toList = (value) => (Array.isArray(value) ? value : [])

// Backend items can be strings or objects, so pick the first readable field
function getItemText(item, keys = ["name", "skill", "title", "description"]) {
  if (typeof item === "string") return item
  if (item && typeof item === "object") {
    for (const key of keys) {
      if (item[key]) return String(item[key])
    }
    return JSON.stringify(item)
  }
  return String(item ?? "")
}

function getScoreTone(score) {
  if (score >= 80) return { label: "Strong", color: "#34d399", text: "text-emerald-300" }
  if (score >= 60) return { label: "Good", color: "#a78bfa", text: "text-violet-300" }
  if (score >= 40) return { label: "Fair", color: "#fbbf24", text: "text-amber-300" }
  return { label: "Needs work", color: "#fb7185", text: "text-rose-300" }
}

function formatDate(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function ScoreRing({ score, size = "large" }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0))
  const tone = getScoreTone(safeScore)
  const outer = size === "large" ? "h-36 w-36" : "h-20 w-20"
  const inner = size === "large" ? "h-28 w-28" : "h-14 w-14"
  const numberClass = size === "large" ? "text-4xl" : "text-lg"

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ${outer}`}
      style={{ background: `conic-gradient(${tone.color} ${safeScore}%, rgba(148,163,184,0.25) 0)` }}
    >
      <div className={`flex flex-col items-center justify-center rounded-full bg-white ${inner}`}>
        <span className={`${numberClass} font-bold text-slate-900`}>{safeScore}</span>
        {size === "large" && <span className="text-xs text-slate-400">out of 100</span>}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, hint, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">{hint}</p>
    </div>
  )
}

function DashboardPage() {
  const navigate = useNavigate()

  const [resumes, setResumes] = useState([])
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  const [listError, setListError] = useState("")

  const [selectedResume, setSelectedResume] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true)
  const [analysisError, setAnalysisError] = useState("")
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
  const [analyzedCount, setAnalyzedCount] = useState(0)


  useEffect(() => {
    async function loadDashboard() {
      setIsLoadingResumes(true)
      setIsLoadingAnalysis(true)

      const [resumeResult, analysisResult] = await Promise.allSettled([
        getMyResumes(),
        getLatestAnalysis(),
      ])

      if (resumeResult.status === "fulfilled") {
        setResumes(resumeResult.value.resumes || [])
        setListError("")
      } else {
        setListError(
          resumeResult.reason?.message || "Could not load your resumes."
        )
      }

      if (analysisResult.status === "fulfilled") {
        const data = analysisResult.value

        setAnalysis(data?.analysis || null)
        setSelectedResume(data?.resume || null)
      } else {
        console.error(
          "Could not load the latest analysis:",
          analysisResult.reason
        )
      }

      setIsLoadingResumes(false)
      setIsLoadingAnalysis(false)
    }

    loadDashboard()
  }, [])

  const handleAnalyzeResume = async (resume) => {
    setSelectedResume(resume)
    setAnalysis(null)
    setAnalysisError("")
    setIsAnalysisOpen(true)

    try {
      const result = await analyzeResume(resume.id)
      setAnalysis(result.analysis)
      setAnalyzedCount((count) => count + 1)
    } catch (error) {
      setAnalysisError(error.message || "Analysis could not be completed.")
    }
  }

  const closeAnalysis = () => setIsAnalysisOpen(false)

  const latestScore = analysis ? Number(analysis.score) || 0 : null
  const latestSkills = toList(analysis?.skills).length
  const isResumeReady = (resume) => Number(resume.text_length) > 0

  return (
    <div className="min-h-screen bg-slate-100">
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-900 px-6 pb-28 pt-10 md:px-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300">
              <Sparkles size={13} />
              YOUR DASHBOARD
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Welcome back
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Upload a resume, run an analysis, and see what to improve before you apply.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.upload)}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/20 transition hover:bg-emerald-50"
          >
            <Upload size={16} />
            Upload resume
          </button>
        </div>
      </section>

      <main className="relative mx-auto -mt-16 max-w-7xl space-y-6 px-6 pb-12 md:px-10">
        {/* STATS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={FileText}
            label="Resumes uploaded"
            value={isLoadingResumes ? "…" : resumes.length}
            hint={resumes.length === 0 ? "Upload your first resume to begin" : "Ready in your library"}
            accent="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={Target}
            label="Analyses this session"
            value={analyzedCount}
            hint="Resets when you refresh the page"
            accent="bg-violet-50 text-violet-600"
          />
          <StatCard
            icon={CheckCircle2}
            label="Latest score"
            value={latestScore === null ? "—" : `${latestScore}/100`}
            hint={latestScore === null ? "Run an analysis to see a score" : getScoreTone(latestScore).label}
            accent="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={Sparkles}
            label="Skills found"
            value={latestScore === null ? "—" : latestSkills}
            hint={latestScore === null ? "Extracted from your latest analysis" : "From your latest analysis"}
            accent="bg-indigo-50 text-indigo-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* LEFT COLUMN */}
          <div className="space-y-6 xl:col-span-2">
            {/* Analysis summary */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Resume analysis</h2>
                  <p className="mt-1 text-sm text-slate-500">Score, skills, and next steps for your resume</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.aiAnalyzer)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Open AI analyzer
                  <ArrowRight size={15} />
                </button>
              </div>

              {isLoadingAnalysis ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
                  <LoaderCircle size={16} className="animate-spin" />
                  Loading your latest analysis...
                </div>
              ) : analysis ? (
                <div className="flex flex-col items-center gap-6 rounded-2xl bg-slate-900 p-6 text-white sm:flex-row">
                  <ScoreRing score={analysis.score} size="small" />
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <p className="text-xs uppercase tracking-wider text-slate-400">Latest analysis</p>
                    <h3 className="mt-1 truncate text-lg font-bold">{selectedResume?.filename}</h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {getScoreTone(latestScore).label} · {latestSkills} skills · {toList(analysis.suggestions).length} suggestions
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAnalysisOpen(true)}
                      className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-50"
                    >
                      View full report
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 px-6 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Target size={26} />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">No analysis yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Pick a resume from the list below and click Analyze. Your score and feedback will show here.
                  </p>
                </div>
              )}
            </section>

            {/* Recent resumes */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Your resumes</h2>
                  <p className="mt-1 text-sm text-slate-500">Latest uploads</p>
                </div>
                {resumes.length > 3 && (
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.aiAnalyzer)}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-900"
                  >
                    View all
                  </button>
                )}
              </div>

              {isLoadingResumes ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                  <LoaderCircle size={16} className="animate-spin" />
                  Loading your resumes...
                </div>
              ) : listError ? (
                <div role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{listError}</span>
                </div>
              ) : resumes.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <FileText size={22} />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-700">No resumes yet</p>
                  <p className="mt-1 text-xs text-slate-400">Upload a PDF or DOCX to get started.</p>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.upload)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <Upload size={15} />
                    Upload resume
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {resumes.slice(0, 3).map((resume) => {
                    const ready = isResumeReady(resume)
                    return (
                      <li
                        key={resume.id}
                        className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{resume.filename}</p>
                            <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                              <Clock size={12} />
                              {formatDate(resume.uploaded_at) || "Date unavailable"}
                              {ready && <span>· {resume.text_length} characters</span>}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAnalyzeResume(resume)}
                          disabled={!ready}
                          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${ready
                              ? "bg-slate-900 text-white hover:bg-slate-800"
                              : "cursor-not-allowed bg-slate-200 text-slate-400"
                            }`}
                        >
                          {ready ? "Analyze" : "Cannot analyze"}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Quick actions</h2>
              <p className="mt-1 text-sm text-slate-500">Jump to the next step</p>

              <div className="mt-5 space-y-3">
                {[
                  {
                    title: "Upload resume",
                    text: "PDF or DOCX, up to 5 MB",
                    icon: Upload,
                    path: ROUTES.upload,
                    accent: "bg-slate-900 text-white",
                  },
                  {
                    title: "AI analyzer",
                    text: "Deeper feedback with AI",
                    icon: Sparkles,
                    path: ROUTES.aiAnalyzer,
                    accent: "bg-emerald-50 text-emerald-600",
                  },
                  {
                    title: "Job matches",
                    text: "Find roles that fit your skills",
                    icon: BriefcaseBusiness,
                    path: ROUTES.jobs,
                    accent: "bg-violet-50 text-violet-600",
                  },
                ].map(({ title, text, icon: Icon, path, accent }) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => navigate(path)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{title}</p>
                      <p className="text-xs text-slate-500">{text}</p>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600">
                <Lightbulb size={19} />
              </div>
              <h2 className="mt-4 font-bold text-slate-900">Tip for better results</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use a text-based PDF or DOCX with clear section headings. Scanned images cannot be read.
              </p>
            </section>
          </aside>
        </div>
      </main>

      {/* ANALYSIS MODAL */}
      {isAnalysisOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAnalysis()
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-analysis-title"
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">AI-powered report</p>
                <h2 id="resume-analysis-title" className="mt-1 text-xl font-bold text-slate-900">
                  Resume insights
                </h2>
                <p className="mt-1 truncate text-sm text-slate-500">{selectedResume?.filename || "Your resume"}</p>
              </div>
              <button
                type="button"
                aria-label="Close resume analysis"
                onClick={closeAnalysis}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-5 sm:p-6">
              {analysisError && (
                <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-white p-5">
                  <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-500" />
                  <div>
                    <h3 className="font-semibold text-rose-700">Analysis could not be completed</h3>
                    <p className="mt-1 break-words text-sm text-slate-600">{analysisError}</p>
                  </div>
                </div>
              )}

              {!analysis && !analysisError && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="relative flex h-14 w-14 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-300/40" />
                    <Sparkles size={24} className="relative text-emerald-500" />
                  </div>
                  <h3 className="mt-5 font-semibold text-slate-900">Analyzing your resume</h3>
                  <p className="mt-1 text-sm text-slate-500">Reviewing your skills, education, and experience…</p>
                </div>
              )}

              {analysis && (
                <div className="space-y-5">
                  {/* Score summary */}
                  <div className="flex flex-col items-center gap-6 rounded-2xl bg-slate-900 p-6 text-white sm:flex-row">
                    <ScoreRing score={analysis.score} size="large" />
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Overall score</p>
                      <h3 className="mt-1 text-xl font-bold">{getScoreTone(latestScore).label}</h3>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-white/5 p-3">
                          <p className="text-2xl font-bold">{toList(analysis.skills).length}</p>
                          <p className="text-xs text-slate-400">Skills</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3">
                          <p className="text-2xl font-bold text-emerald-300">{toList(analysis.strengths).length}</p>
                          <p className="text-xs text-slate-400">Strengths</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3">
                          <p className="text-2xl font-bold text-rose-300">{toList(analysis.suggestions).length}</p>
                          <p className="text-xs text-slate-400">Suggestions</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                      <Sparkles size={16} className="text-violet-600" />
                      Skills identified
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {toList(analysis.skills).length > 0 ? (
                        toList(analysis.skills).map((skill, index) => (
                          <span key={index} className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white">
                            {getItemText(skill)}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400">No skills found.</p>
                      )}
                    </div>
                  </section>

                  {/* Education / Experience / Projects */}
                  <div className="grid gap-5 md:grid-cols-3">
                    {[
                      { title: "Education", icon: GraduationCap, color: "text-blue-600", items: analysis.education, empty: "No education details found." },
                      { title: "Experience", icon: BriefcaseBusiness, color: "text-indigo-600", items: analysis.experience, empty: "No experience details found." },
                      { title: "Projects", icon: FolderKanban, color: "text-cyan-600", items: analysis.projects, empty: "No projects found." },
                    ].map(({ title, icon: Icon, color, items, empty }) => (
                      <section key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                          <Icon size={16} className={color} />
                          {title}
                        </h3>
                        <div className="mt-4 space-y-2">
                          {toList(items).length > 0 ? (
                            toList(items).map((item, index) => (
                              <div key={index} className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                                {getItemText(item, ["degree", "role", "name", "title", "description"])}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400">{empty}</p>
                          )}
                        </div>
                      </section>
                    ))}
                  </div>

                  {/* Strengths / Weaknesses */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                      <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                        <ThumbsUp size={16} className="text-emerald-600" />
                        Strengths
                      </h3>
                      <ul className="mt-4 space-y-3">
                        {toList(analysis.strengths).length > 0 ? (
                          toList(analysis.strengths).map((item, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                              <CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-500" />
                              <span>{getItemText(item, ["description", "title"])}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-slate-400">No strengths identified.</li>
                        )}
                      </ul>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                      <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                        <TriangleAlert size={16} className="text-amber-600" />
                        Areas to improve
                      </h3>
                      <ul className="mt-4 space-y-3">
                        {toList(analysis.weaknesses).length > 0 ? (
                          toList(analysis.weaknesses).map((item, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                              <TriangleAlert size={16} className="mt-1 shrink-0 text-amber-500" />
                              <span>{getItemText(item, ["description", "title"])}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-slate-400">No weaknesses identified.</li>
                        )}
                      </ul>
                    </section>
                  </div>

                  {/* Suggestions */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                      <Lightbulb size={16} className="text-indigo-600" />
                      Recommended next steps
                    </h3>
                    <ol className="mt-4 space-y-3">
                      {toList(analysis.suggestions).length > 0 ? (
                        toList(analysis.suggestions).map((item, index) => (
                          <li key={index} className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                              {index + 1}
                            </span>
                            <span className="text-sm leading-6 text-slate-700">
                              {getItemText(item, ["description", "title"])}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-slate-400">No suggestions available.</li>
                      )}
                    </ol>
                  </section>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
              <p className="hidden text-xs text-slate-400 sm:block">
                AI feedback is guidance, not a guarantee of hiring outcomes.
              </p>
              <button
                type="button"
                onClick={closeAnalysis}
                className="ml-auto rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage