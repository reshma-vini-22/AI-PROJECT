import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleX,
  Clock,
  ExternalLink,
  FileText,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Upload,
  X,
} from "lucide-react"
import {
  getMyResumes,
  getJobMatches,
  getLatestAnalysis,
} from "../services/api"
import { getSettings } from "../utils/settings"

const ROUTES = {
  upload: "/resume-upload",
  settings: "/settings",
}

const SAVED_KEY = "resumeai_saved_jobs"
const LAST_VISIT_KEY = "resumeai_jobs_last_visit"

const TIERS = [
  { id: "all", label: "All", min: 0 },
  { id: "60", label: "60%+", min: 60 },
  { id: "80", label: "80%+", min: 80 },
]

const JOB_SITES = {
  linkedin: {
    label: "LinkedIn",
    style: "bg-[#0A66C2] text-white hover:bg-[#004182]",
    build: (keywords, location) =>
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`,
  },
  indeed: {
    label: "Indeed",
    style: "bg-[#2557A7] text-white hover:bg-[#1b4180]",
    build: (keywords, location) =>
      `https://in.indeed.com/jobs?q=${encodeURIComponent(keywords)}&l=${encodeURIComponent(location)}`,
  },
  naukri: {
    label: "Naukri",
    style: "bg-[#4A90E2] text-white hover:bg-[#357abd]",
    build: (keywords) =>
      `https://www.naukri.com/${keywords.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-jobs`,
  },
}

const clampStyle = {
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
}

// ---------- Helpers ----------

const toList = (value) => (Array.isArray(value) ? value : [])

function tierFromMin(min) {
  if (min >= 80) return "80"
  if (min >= 60) return "60"
  return "all"
}

function scoreStyle(score) {
  if (score >= 80) {
    return { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", bar: "bg-emerald-500" }
  }
  if (score >= 60) {
    return { pill: "bg-violet-50 text-violet-700 ring-violet-200", bar: "bg-violet-500" }
  }
  return { pill: "bg-amber-50 text-amber-700 ring-amber-200", bar: "bg-amber-500" }
}

function timeAgo(value) {
  if (!value) return "Date unknown"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unknown"
  const days = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (days <= 0) return "Posted today"
  if (days === 1) return "Posted 1 day ago"
  return `Posted ${days} days ago`
}

function initialsOf(name) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
  return letters.toUpperCase() || "JB"
}

// Converts the backend's snake_case job into the shape this page uses
function mapJob(job) {
  const company = job.company || "Unknown company"
  return {
    id: job.id,
    title: job.title || "Untitled role",
    company,
    location: job.location || "Location not specified",
    salary: job.salary || null,
    description: job.description || "",
    source: job.source || "",
    applyUrl: job.apply_url || null,
    postedAt: job.posted_at || null,
    isNew: Boolean(job.is_new),
    match: Math.round(Number(job.match_percent) || 0),
    matched: toList(job.matched_skills),
    missing: toList(job.missing_skills),
    initials: initialsOf(company),
  }
}

// ---------- Small components ----------

function StatTile({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <Icon size={16} className="text-emerald-300" />
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}

function SkillChip({ children, missing = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${missing ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
        }`}
    >
      {missing ? <CircleX size={12} /> : <CheckCircle2 size={12} />}
      {children}
    </span>
  )
}

function JobCard({ job, saved, showSkillGaps, onOpen, onToggleSave }) {
  const style = scoreStyle(job.match)
  const total = job.matched.length + job.missing.length

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-md sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
          {job.initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <button
                type="button"
                onClick={onOpen}
                className="block max-w-full truncate text-left text-base font-bold text-slate-900 hover:text-emerald-700"
              >
                {job.title}
              </button>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <Building2 size={13} className="shrink-0" />
                <span className="truncate">{job.company}</span>
              </p>
            </div>

            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ring-1 ${style.pill}`}>
              {job.match}% match
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {timeAgo(job.postedAt)}
            </span>
            <span className="flex items-center gap-1">
              <BriefcaseBusiness size={13} />
              {job.salary || "Salary not disclosed"}
            </span>
            {job.isNew && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
                New
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs">
          <span className="font-semibold text-slate-600">Skill match</span>
          <span className="text-slate-400">
            {job.matched.length} of {total} skills
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${job.match}%` }} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.matched.slice(0, 5).map((skill) => (
          <SkillChip key={`m-${skill}`}>{skill}</SkillChip>
        ))}
        {showSkillGaps &&
          job.missing.slice(0, 3).map((skill) => (
            <SkillChip key={`x-${skill}`} missing>
              {skill}
            </SkillChip>
          ))}
      </div>

      {job.description && (
        <p className="mt-4 text-sm leading-6 text-slate-600" style={clampStyle}>
          {job.description}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onToggleSave}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${saved ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100"
            }`}
        >
          {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          {saved ? "Saved" : "Save"}
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Details
          </button>

          {job.applyUrl && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Original listing
              <ExternalLink size={14} />
            </a>
          )}

          <a
            href={JOB_SITES.linkedin.build(job.title, job.location)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Find on LinkedIn
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </article>
  )
}

function JobDrawer({ job, saved, showSkillGaps, onClose, onToggleSave }) {
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  const style = scoreStyle(job.match)
  const total = job.matched.length + job.missing.length

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-detail-title"
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Job details</p>
          <button
            type="button"
            aria-label="Close job details"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
              {job.initials}
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="job-detail-title" className="text-xl font-bold text-slate-900">
                {job.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{job.company}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5">
                  <MapPin size={12} />
                  {job.location}
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5">
                  <Clock size={12} />
                  {timeAgo(job.postedAt)}
                </span>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">
                  {job.salary || "Salary not disclosed"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 p-5 text-white">
            <p className="text-xs uppercase tracking-wider text-slate-400">Skill match</p>
            <p className="mt-1 text-3xl font-bold">{job.match}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${job.match}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Your resume matches {job.matched.length} of {total} skills listed in this job.
            </p>
          </div>

          {job.matched.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900">Skills you have</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.matched.map((skill) => (
                  <SkillChip key={`dm-${skill}`}>{skill}</SkillChip>
                ))}
              </div>
            </div>
          )}

          {showSkillGaps && job.missing.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900">Skills to develop</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.missing.map((skill) => (
                  <SkillChip key={`dx-${skill}`} missing>
                    {skill}
                  </SkillChip>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-slate-900">Description</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
              {job.description || "No description was provided for this listing."}
            </p>
            <p className="mt-3 text-xs text-slate-400">
              This is a summary. Open the original listing for full details and requirements.
            </p>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 p-6">
          <button
            type="button"
            onClick={() => onToggleSave(job.id)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            {saved ? "Saved" : "Save"}
          </button>

          {job.applyUrl && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Original listing
              <ExternalLink size={15} />
            </a>
          )}

          <a
            href={JOB_SITES.linkedin.build(job.title, job.location)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0A66C2] px-4 py-3 text-sm font-semibold text-white hover:bg-[#004182]"
          >
            Find on LinkedIn
            <ExternalLink size={15} />
          </a>
        </div>
      </section>
    </div>
  )
}

// ---------- Page ----------

export default function JobMatchesPage() {
  const navigate = useNavigate()
  const [settings] = useState(getSettings)

  const [resumes, setResumes] = useState([])
  const [resumesLoading, setResumesLoading] = useState(true)
  const [selectedResumeId, setSelectedResumeId] = useState("")

  const [jobs, setJobs] = useState([])
  const [resumeSkills, setResumeSkills] = useState([])
  const [lastRefreshed, setLastRefreshed] = useState(null)
  const [newCount, setNewCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [tier, setTier] = useState(() => tierFromMin(settings.minMatch))
  const [sortBy, setSortBy] = useState("match")
  const [selectedJob, setSelectedJob] = useState(null)
  const [savedJobs, setSavedJobs] = useState([])
  const [siteLocation, setSiteLocation] = useState(settings.defaultLocation || "India")
  const [preferredSite, setPreferredSite] = useState(settings.jobSite || "linkedin")

  // Ignores responses from older requests when the user switches resumes quickly
  const requestRef = useRef(0)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]")
      setSavedJobs(Array.isArray(saved) ? saved : [])
    } catch {
      setSavedJobs([])
    }
  }, [])


  useEffect(() => {
    async function loadResumes() {
      try {
        const [resumeData, latestData] = await Promise.all([
          getMyResumes(),
          getLatestAnalysis(),
        ])

        const list = toList(resumeData.resumes).sort(
          (a, b) =>
            new Date(b.uploaded_at || 0) - new Date(a.uploaded_at || 0)
        )

        setResumes(list)

        // Prefer the resume with the latest saved analysis.
        const latestResumeId = latestData?.resume?.id

        if (latestResumeId && list.some(
          (resume) => resume.id === latestResumeId
        )) {
          setSelectedResumeId(String(latestResumeId))
        } else if (list.length > 0) {
          setSelectedResumeId(String(list[0].id))
        }
      } catch (err) {
        setError(err.message || "Could not load your resumes.")
      } finally {
        setResumesLoading(false)
      }
    }

    loadResumes()
  }, [])


  async function loadMatches(resumeId, refresh = false) {
    const requestId = ++requestRef.current
    setError("")
    if (refresh) setRefreshing(true)
    else setLoading(true)

    try {
      const since = localStorage.getItem(LAST_VISIT_KEY) || undefined
      const data = await getJobMatches(resumeId, { refresh, since })
      if (requestId !== requestRef.current) return

      const mapped = toList(data.jobs).map(mapJob)
      setJobs(mapped)
      setResumeSkills(toList(data.resume_skills))
      setLastRefreshed(data.last_refreshed || null)
      setNewCount(mapped.filter((job) => job.isNew).length)
      localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString())
    } catch (err) {
      if (requestId !== requestRef.current) return
      setJobs([])
      setError(err.message || "Could not load job matches.")
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }

  useEffect(() => {
    if (selectedResumeId) loadMatches(selectedResumeId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResumeId])

  function toggleSave(jobId) {
    setSavedJobs((prev) => {
      const next = prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
      localStorage.setItem(SAVED_KEY, JSON.stringify(next))
      return next
    })
  }

  const visibleJobs = useMemo(() => {
    const term = search.trim().toLowerCase()
    const minScore = TIERS.find((item) => item.id === tier)?.min ?? 0

    const filtered = jobs.filter((job) => {
      if (job.match < minScore) return false
      if (!term) return true
      return [job.title, job.company, job.location, ...job.matched].some((value) =>
        value.toLowerCase().includes(term)
      )
    })

    return [...filtered].sort((a, b) =>
      sortBy === "newest"
        ? new Date(b.postedAt || 0) - new Date(a.postedAt || 0)
        : b.match - a.match
    )
  }, [jobs, search, tier, sortBy])

  const savedCount = savedJobs.length
  const isBusy = loading || refreshing
  const searchKeywords = resumeSkills.slice(0, 3).join(" ") || "software"
  const showSkillGaps = settings.showSkillGaps !== false

  return (
    <div className="min-h-screen bg-slate-100">
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-900 px-6 pb-28 pt-10 md:px-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300">
                <Sparkles size={13} />
                JOB MATCHES
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Roles that fit your resume
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Live job listings, ranked by how many of the skills they ask for appear in your resume.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadMatches(selectedResumeId, true)}
              disabled={!selectedResumeId || isBusy}
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/20 transition hover:bg-emerald-50 disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh jobs"}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Matches" value={jobs.length} icon={BriefcaseBusiness} />
            <StatTile label="New since last visit" value={newCount} icon={Bell} />
            <StatTile label="Saved" value={savedCount} icon={Bookmark} />
            <StatTile label="Skills detected" value={resumeSkills.length} icon={Sparkles} />
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="relative mx-auto -mt-16 grid max-w-7xl items-start gap-6 px-6 pb-12 md:px-10 lg:grid-cols-[320px_1fr]">
        {/* LEFT PANEL */}
        <aside className="space-y-5 lg:sticky lg:top-6">
          <section className="rounded-2xl bg-white p-5 shadow-xl shadow-slate-900/10">
            <label htmlFor="resume-select" className="mb-2 block text-sm font-semibold text-slate-900">
              Resume
            </label>

            {resumesLoading ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-500">
                <LoaderCircle size={16} className="animate-spin" />
                Loading resumes...
              </div>
            ) : resumes.length > 0 ? (
              <div className="relative">
                <FileText
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  id="resume-select"
                  value={selectedResumeId}
                  onChange={(event) => setSelectedResumeId(event.target.value)}
                  disabled={isBusy}
                  className="w-full cursor-pointer appearance-none rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm font-medium text-slate-800 outline-none transition hover:border-slate-300 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:opacity-60"
                >
                  {resumes.map((resume) => (
                    <option key={resume.id} value={String(resume.id)}>
                      {resume.filename}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                <FileText size={24} className="mx-auto text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">No resumes yet.</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate(ROUTES.upload)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50"
            >
              <Upload size={15} />
              Upload resume
            </button>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Your skills</h2>
            <p className="mt-1 text-xs text-slate-500">Matching uses these skills from your resume.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {resumeSkills.length > 0 ? (
                resumeSkills.slice(0, 20).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">No skills detected yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Search job sites</h2>
            <p className="mt-1 text-xs text-slate-500">
              Open a search for your top skills. You apply on the job site itself.
            </p>

            <div className="mt-4 space-y-3">
              <div className="relative">
                <MapPin size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={siteLocation}
                  onChange={(event) => setSiteLocation(event.target.value)}
                  placeholder="Location"
                  className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Object.entries(JOB_SITES).map(([id, site]) => (
                  <a
                    key={id}
                    href={site.build(searchKeywords, siteLocation || "India")}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setPreferredSite(id)}
                    className={`inline-flex items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-xs font-semibold transition ${site.style} ${preferredSite === id ? "ring-2 ring-emerald-400 ring-offset-2" : ""
                      }`}
                  >
                    {site.label}
                    <ExternalLink size={12} />
                  </a>
                ))}
              </div>
            </div>
          </section>

          <button
            type="button"
            onClick={() => navigate(ROUTES.settings)}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-sm"
          >
            <span className="flex items-center gap-3">
              <SettingsIcon size={17} className="text-slate-500" />
              <span className="text-sm font-semibold text-slate-900">Job preferences</span>
            </span>
            <ArrowRight size={15} className="text-slate-400" />
          </button>
        </aside>

        {/* RESULTS */}
        <section className="min-w-0 space-y-5">
          {/* Toolbar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by role, company, location, or skill"
                  className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-xl bg-slate-100 p-1">
                  {TIERS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTier(item.id)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${tier === item.id
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <select
                    aria-label="Sort jobs"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="appearance-none rounded-xl border-2 border-slate-100 bg-slate-50 py-2.5 pl-4 pr-9 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-400"
                  >
                    <option value="match">Best match</option>
                    <option value="newest">Newest</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <span>
                Showing <strong className="text-slate-800">{visibleJobs.length}</strong> of {jobs.length} matches
              </span>
              <span>
                {lastRefreshed
                  ? `Listings refreshed ${timeAgo(lastRefreshed).replace("Posted ", "")}`
                  : "Not refreshed yet"}
              </span>
            </div>
          </div>

          {settings.emailAlerts !== false && newCount > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <Bell size={16} className="shrink-0" />
              <span>
                <strong>{newCount} new {newCount === 1 ? "job" : "jobs"}</strong> since your last visit.
              </span>
            </div>
          )}

          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* States */}
          {resumesLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-white py-16 text-sm text-slate-500">
              <LoaderCircle size={16} className="animate-spin" />
              Loading your profile...
            </div>
          ) : resumes.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <FileText size={26} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900">Upload a resume to see matches</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                We compare the skills in your resume with live job listings and rank them for you.
              </p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.upload)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Upload size={16} />
                Upload resume
              </button>
            </div>
          ) : loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-200" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-2/3 rounded bg-slate-200" />
                      <div className="h-3 w-1/3 rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="mt-6 h-2 rounded-full bg-slate-100" />
                  <div className="mt-4 flex gap-2">
                    <div className="h-7 w-20 rounded-lg bg-slate-100" />
                    <div className="h-7 w-24 rounded-lg bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <BriefcaseBusiness size={28} className="mx-auto text-slate-300" />
              <h3 className="mt-4 font-bold text-slate-900">No matching jobs yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                No listings share skills with this resume. Try refreshing, or add more skills to the resume.
              </p>
              <button
                type="button"
                onClick={() => loadMatches(selectedResumeId, true)}
                disabled={isBusy}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                <RefreshCw size={14} />
                Refresh jobs
              </button>
            </div>
          ) : visibleJobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <Search size={28} className="mx-auto text-slate-300" />
              <h3 className="mt-4 font-bold text-slate-900">No jobs match these filters</h3>
              <p className="mt-2 text-sm text-slate-500">Try a different keyword or a lower match filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setTier("all")
                }}
                className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-4 md:grid-cols-2 ${isBusy ? "opacity-60" : ""}`}>
              {visibleJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  saved={savedJobs.includes(job.id)}
                  showSkillGaps={showSkillGaps}
                  onOpen={() => setSelectedJob(job)}
                  onToggleSave={() => toggleSave(job.id)}
                />
              ))}
            </div>
          )}

          <p className="pt-2 text-center text-xs text-slate-400">
            Job listings are provided by Adzuna. Match scores compare listed skills with your resume.
            Always confirm details on the original listing before applying.
          </p>
        </section>
      </main>

      {selectedJob && (
        <JobDrawer
          job={selectedJob}
          saved={savedJobs.includes(selectedJob.id)}
          showSkillGaps={showSkillGaps}
          onClose={() => setSelectedJob(null)}
          onToggleSave={toggleSave}
        />
      )}
    </div>
  )
}