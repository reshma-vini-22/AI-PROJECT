import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileSearch,
  FileText,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  ScanText,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
} from "lucide-react"
import { getMyResumes } from "../services/api"

const analysisAreas = [
  {
    title: "Resume score",
    description: "Get an overview of resume quality and completeness.",
    icon: Target,
  },
  {
    title: "Skills and experience",
    description: "See your detected skills, experience, and education.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Strengths and improvements",
    description: "Receive practical feedback to help strengthen your resume.",
    icon: TrendingUp,
  },
  {
    title: "ATS readability",
    description: "Review structure and keyword coverage for applicant systems.",
    icon: ScanText,
  },
]

function AiAnalyser() {
  const navigate = useNavigate()
  const [resumes, setResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

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

  const selectedResume = resumes.find(
    (resume) => String(resume.id) === selectedResumeId
  )

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              <Sparkles size={14} />
              RESUME INSIGHTS
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              AI Resume Analyzer
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review your resume and get ready for personalized feedback on
              your skills, experience, and opportunities to improve.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/resume-upload")}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Upload size={17} />
            Upload a resume
          </button>
        </header>

        <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <FileSearch size={25} />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Make your next application stronger.
              </h2>
              <p className="mt-2 text-sm leading-6 text-indigo-100">
                Choose an uploaded resume to prepare an analysis. AI-powered
                results will appear here once the analyzer integration is
                connected.
              </p>
            </div>

            <div className="w-full rounded-xl border border-white/20 bg-white/10 p-4 lg:max-w-sm">
              <label
                htmlFor="resume-selection"
                className="mb-2 block text-sm font-semibold"
              >
                Resume to analyze
              </label>
              {isLoading ? (
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-3 text-sm text-slate-500">
                  <LoaderCircle size={16} className="animate-spin" />
                  Loading your resumes...
                </div>
              ) : resumes.length > 0 ? (
                <select
                  id="resume-selection"
                  value={selectedResumeId}
                  onChange={(event) => setSelectedResumeId(event.target.value)}
                  className="w-full rounded-lg border border-white/30 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {resumes.map((resume) => (
                    <option key={resume.id} value={String(resume.id)}>
                      {resume.filename}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-lg bg-white px-3 py-3 text-sm text-slate-600">
                  No resumes uploaded yet.
                </div>
              )}
              {selectedResume && (
                <p className="mt-2 truncate text-xs text-indigo-100">
                  Selected: {selectedResume.filename}
                </p>
              )}
              {error && (
                <p role="alert" className="mt-2 text-sm text-rose-100">
                  {error}
                </p>
              )}
              <button
                type="button"
                disabled
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white/20 px-4 py-3 text-sm font-semibold text-white opacity-80"
                title="AI analysis will be available after the integration is connected."
              >
                <Sparkles size={16} />
                AI analysis coming soon
              </button>
              {!isLoading && resumes.length === 0 && (
                <button
                  type="button"
                  onClick={() => navigate("/resume-upload")}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Upload your first resume
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              What your analysis will cover
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              The analyzer is being prepared to provide these insights.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {analysisAreas.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-5 text-slate-500">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Lightbulb size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">
                  Your analysis workspace
                </h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  After AI integration is complete, your score, detected
                  information, strengths, and recommended next steps will be
                  shown here. No analysis results are generated yet.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {["Resume score", "Skills detected", "Suggestions"].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-xs font-medium text-slate-500">{item}</p>
                  <p className="mt-2 text-xl font-bold text-slate-300">—</p>
                  <p className="mt-1 text-xs text-slate-400">Not analyzed</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700">
              <LockKeyhole size={20} />
            </div>
            <h2 className="mt-4 font-bold text-slate-900">
              Before you analyze
            </h2>
            <ul className="mt-3 space-y-3 text-sm leading-5 text-slate-600">
              <li className="flex gap-2">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
                Upload a clear, up-to-date PDF or DOCX resume.
              </li>
              <li className="flex gap-2">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
                Check that your contact details are current.
              </li>
              <li className="flex gap-2">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
                Review generated feedback before making changes.
              </li>
            </ul>
            <div className="mt-5 flex items-center gap-2 border-t border-emerald-100 pt-4 text-xs leading-5 text-slate-500">
              <FileText size={16} className="shrink-0" />
              Analysis insights will be guidance, not a guarantee of hiring
              outcomes.
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}

export default AiAnalyser
