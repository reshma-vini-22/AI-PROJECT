import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  FileText,
  FolderKanban,
  GraduationCap,
  Lightbulb,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Target,
  ThumbsUp,
  TriangleAlert,
  Upload,
} from "lucide-react"
import { getMyResumes, getAIResumeAnalysis } from "../services/api"

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "profile", label: "Profile" },
  { id: "plan", label: "Action plan" },
]

// Keeps list fields as arrays even if the backend sends null
const toList = (value) => (Array.isArray(value) ? value : [])

function getScoreTone(score) {
  if (score >= 80) return { label: "Strong", color: "#34d399", text: "text-emerald-300" }
  if (score >= 60) return { label: "Good", color: "#a78bfa", text: "text-violet-300" }
  if (score >= 40) return { label: "Fair", color: "#fbbf24", text: "text-amber-300" }
  return { label: "Needs work", color: "#fb7185", text: "text-rose-300" }
}

function ScoreRing({ score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0))
  const tone = getScoreTone(safeScore)

  return (
    <div className="flex flex-col items-center">
      <div
        className="flex h-40 w-40 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${tone.color} ${safeScore}%, rgba(255,255,255,0.08) 0)`,
        }}
      >
        <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-slate-900">
          <span className="text-4xl font-bold text-white">{safeScore}</span>
          <span className="text-xs text-slate-400">out of 100</span>
        </div>
      </div>
      <span className={`mt-3 text-sm font-semibold ${tone.text}`}>{tone.label}</span>
    </div>
  )
}

function ItemList({ items, emptyText, variant = "check" }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">{emptyText}</p>
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={`${variant}-${index}`} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
          {variant === "check" ? (
            <CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-500" />
          ) : (
            <TriangleAlert size={16} className="mt-1 shrink-0 text-amber-500" />
          )}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function InfoCard({ title, icon: Icon, accent, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={19} />
        </div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function AiAnalyser() {
  const navigate = useNavigate()
  const [resumes, setResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    async function loadResumes() {
      try {
        const data = await getMyResumes()
        const availableResumes = Array.isArray(data.resumes) ? data.resumes : []

        setResumes(availableResumes)
        if (availableResumes.length > 0) {
          setSelectedResumeId(String(availableResumes[0].id))
        }
      } catch (loadError) {
        setError(loadError.message || "Unable to load your resumes.")
      } finally {
        setIsLoading(false)
      }
    }

    loadResumes()
  }, [])

  const selectedResume = resumes.find((resume) => String(resume.id) === selectedResumeId)

  async function handleAnalyze() {
    if (!selectedResumeId) {
      setError("Please select a resume first.")
      return
    }

    setIsAnalyzing(true)
    setError("")
    setAnalysis(null)
    setActiveTab("overview")

    try {
      const response = await getAIResumeAnalysis(selectedResumeId)
      setAnalysis(response.analysis)
    } catch (analysisError) {
      setError(analysisError.message || "AI resume analysis failed.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const skills = toList(analysis?.skills)
  const education = toList(analysis?.education)
  const experience = toList(analysis?.experience)
  const projects = toList(analysis?.projects)
  const strengths = toList(analysis?.strengths)
  const weaknesses = toList(analysis?.weaknesses)
  const suggestions = toList(analysis?.suggestions)

  return (
    <div className="min-h-screen bg-slate-100">
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-900 px-5 pb-24 pt-10 sm:px-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300">
              <Sparkles size={13} />
              AI RESUME ANALYZER
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              See how your resume reads to a recruiter.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Choose a resume, run the analysis, and get a score, a breakdown of your
              profile, and a clear list of what to improve.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/resume-upload")}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            <Upload size={16} />
            Upload resume
          </button>
        </div>
      </section>

      {/* MAIN LAYOUT */}
      <main className="relative mx-auto -mt-14 grid max-w-6xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[340px_1fr]">
        {/* LEFT: resume picker */}
                {/* LEFT: resume picker */}
        <aside className="h-fit space-y-5 rounded-2xl bg-white p-5 shadow-xl shadow-slate-900/10 lg:sticky lg:top-6">
          <div>
            <label
              htmlFor="resume-select"
              className="mb-2 block text-sm font-semibold text-slate-900"
            >
              Select a resume
            </label>

            {isLoading ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-500">
                <LoaderCircle size={16} className="animate-spin" />
                Loading your resumes...
              </div>
            ) : resumes.length > 0 ? (
              <div className="group relative">
                <FileText
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-emerald-500"
                />
                <select
                  id="resume-select"
                  value={selectedResumeId}
                  onChange={(event) => setSelectedResumeId(event.target.value)}
                  disabled={isAnalyzing}
                  className="w-full cursor-pointer appearance-none rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-11 pr-11 text-sm font-medium text-slate-800 outline-none transition hover:border-slate-300 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resumes.map((resume) => (
                    <option key={resume.id} value={String(resume.id)}>
                      {resume.filename}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                <FileText size={26} className="mx-auto text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">No resumes uploaded yet.</p>
              </div>
            )}
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!selectedResumeId || isAnalyzing || isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : analysis ? (
                <>
                  <RefreshCw size={16} />
                  Run again
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Analyze with AI
                </>
              )}
            </button>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              or
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={() => navigate("/resume-upload")}
              disabled={isAnalyzing}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-50"
            >
              <Upload size={16} />
              Upload resume
            </button>
          </div>

          <p className="text-center text-xs text-slate-400">Powered by Groq AI</p>
        </aside>

        {/* RIGHT: results */}
        <section className="min-w-0">
          {/* Loading */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-20 text-center">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-300/40" />
                <Sparkles size={26} className="relative text-emerald-500" />
              </div>
              <h2 className="mt-6 text-lg font-bold text-slate-900">Reading your resume</h2>
              <p className="mt-1 text-sm text-slate-500">This usually takes a few seconds.</p>
            </div>
          )}

          {/* Empty */}
          {!analysis && !isAnalyzing && (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Target size={26} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900">Your results will appear here</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Select a resume on the left and run the analysis. You will get an overall
                score, your skills and experience, and a step-by-step improvement plan.
              </p>
            </div>
          )}

          {/* Results */}
          {analysis && !isAnalyzing && (
            <div className="space-y-6">
              {/* Score header */}
              <div className="flex flex-col items-center gap-6 rounded-2xl bg-slate-900 p-6 text-white sm:flex-row sm:p-8">
                <ScoreRing score={analysis.score} />
                <div className="flex-1 space-y-4 text-center sm:text-left">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">Analyzed resume</p>
                    <h2 className="mt-1 truncate text-xl font-bold">{selectedResume?.filename}</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-2xl font-bold text-white">{skills.length}</p>
                      <p className="text-xs text-slate-400">Skills</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-2xl font-bold text-emerald-300">{strengths.length}</p>
                      <p className="text-xs text-slate-400">Strengths</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-2xl font-bold text-rose-300">{suggestions.length}</p>
                      <p className="text-xs text-slate-400">Suggestions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 rounded-xl bg-white p-1.5 shadow-sm" role="tablist">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      activeTab === tab.id
                        ? "bg-slate-900 text-white shadow"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Overview tab */}
              {activeTab === "overview" && (
                <div className="grid gap-6 md:grid-cols-2">
                  <InfoCard title="Strengths" icon={ThumbsUp} accent="bg-emerald-50 text-emerald-600">
                    <ItemList items={strengths} emptyText="No strengths identified." variant="check" />
                  </InfoCard>
                  <InfoCard title="Areas to improve" icon={TriangleAlert} accent="bg-amber-50 text-amber-600">
                    <ItemList items={weaknesses} emptyText="No weaknesses identified." variant="warn" />
                  </InfoCard>
                </div>
              )}

              {/* Profile tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <InfoCard title="Skills" icon={Sparkles} accent="bg-violet-50 text-violet-600">
                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No skills were identified in this resume.</p>
                    )}
                  </InfoCard>

                  <div className="grid gap-6 md:grid-cols-3">
                    <InfoCard title="Education" icon={GraduationCap} accent="bg-blue-50 text-blue-600">
                      <ItemList items={education} emptyText="No education details found." />
                    </InfoCard>
                    <InfoCard title="Experience" icon={BriefcaseBusiness} accent="bg-indigo-50 text-indigo-600">
                      <ItemList items={experience} emptyText="No experience details found." />
                    </InfoCard>
                    <InfoCard title="Projects" icon={FolderKanban} accent="bg-cyan-50 text-cyan-600">
                      <ItemList items={projects} emptyText="No projects found." />
                    </InfoCard>
                  </div>
                </div>
              )}

              {/* Action plan tab */}
              {activeTab === "plan" && (
                <InfoCard title="Recommended next steps" icon={Lightbulb} accent="bg-amber-50 text-amber-600">
                  {suggestions.length > 0 ? (
                    <ol className="space-y-3">
                      {suggestions.map((item, index) => (
                        <li key={`suggestion-${index}`} className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                            {index + 1}
                          </span>
                          <span className="text-sm leading-6 text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-slate-400">No suggestions available.</p>
                  )}
                </InfoCard>
              )}

              <p className="text-center text-xs text-slate-400">
                AI feedback is guidance, not a guarantee of hiring outcomes. Review it before making changes.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default AiAnalyser