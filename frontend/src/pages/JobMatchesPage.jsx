
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getMyResumes, getJobMatches } from "../services/api"
import {
    
    Upload,
    BriefcaseBusiness,
    BrainCircuit,
    
    Search,
    Bell,
    Bookmark,
    BookmarkCheck,
    MapPin,

    Clock3,
    ExternalLink,
    X,
    CheckCircle2,
    ChevronDown,
    SlidersHorizontal,
    Sparkles,
    FileSearch,
    ArrowUpRight,
    Building2,

    CircleCheck,
    CircleX,
    
} from "lucide-react"

// --------------------------------------------------
// MOCK JOB DATA
// Replace this with your backend job-matching API later.
// --------------------------------------------------


// --------------------------------------------------
// REUSABLE COMPONENTS
// --------------------------------------------------

function MatchBadge({ score }) {
    const styles =
        score >= 90
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
            : score >= 80
                ? "bg-blue-50 text-blue-700 ring-blue-200"
                : "bg-amber-50 text-amber-700 ring-amber-200"

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${styles}`}
        >
            <Sparkles size={13} />
            {score}% Match
        </span>
    )
}

function SkillTag({ children, missing = false }) {
    return (
        <span
            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${missing
                    ? "bg-rose-50 text-rose-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
        >
            {missing ? (
                <CircleX size={12} className="mr-1" />
            ) : (
                <CircleCheck size={12} className="mr-1" />
            )}
            {children}
        </span>
    )
}



function JobCard({
    job,
    saved,
    status,
    onOpen,
    onSave,
    onStatusChange,
}) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md sm:p-6">
            <div className="flex items-start gap-4">
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${job.color}`}
                >
                    {job.initials}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <button
                                type="button"
                                onClick={onOpen}
                                className="text-left text-base font-bold text-slate-900 hover:text-indigo-600"
                            >
                                {job.title}
                            </button>
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                                <Building2 size={14} />
                                {job.company}
                            </p>
                        </div>

                        <MatchBadge score={job.match} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            {job.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <BriefcaseBusiness size={14} />
                            {job.type}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock3 size={14} />
                            {job.posted} {job.posted === 1 ? "day" : "days"} ago
                        </span>
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2">
                        <p className="text-xs font-semibold text-slate-700">
                            {job.salary || "Salary not specified"}
                            <span className="ml-2 font-normal text-slate-400">
                                · {job.workplace}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Skills matched
                </p>
                <div className="flex flex-wrap gap-2">
                    {job.matchedSkills.map((skill) => (
                        <SkillTag key={skill}>{skill}</SkillTag>
                    ))}
                </div>
            </div>

            <div className="mt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Skills to develop
                </p>
                <div className="flex flex-wrap gap-2">
                    {job.missingSkills.map((skill) => (
                        <SkillTag key={skill} missing>
                            {skill}
                        </SkillTag>
                    ))}
                </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <button
                    type="button"
                    onClick={onSave}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${saved
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                >
                    {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    {saved ? "Saved" : "Save Job"}
                </button>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={onOpen}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        View Details
                    </button>

                    {status === "Applied" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                            <CheckCircle2 size={15} />
                            Applied
                        </span>
                    ) : (
                        <a
                            href={job.applicationUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => onStatusChange("Applied")}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                            Apply Now
                            <ArrowUpRight size={15} />
                        </a>
                    )}
                </div>
            </div>
        </article>
    )
}

// --------------------------------------------------
// MAIN PAGE
// --------------------------------------------------

export default function JobMatchesPage() {
    const navigate = useNavigate()

    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [quality, setQuality] = useState("All")
    const [sortBy, setSortBy] = useState("match")
    const [selectedJob, setSelectedJob] = useState(null)
    const [savedJobs, setSavedJobs] = useState([])
    const [statuses, setStatuses] = useState({})
    const [hasAnalyzedResume, setHasAnalyzedResume] = useState(true)
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
  async function loadJobMatches() {
    setLoading(true)

    try {
      const resumeResponse = await getMyResumes()
      const resumes = resumeResponse.resumes || []

      if (resumes.length === 0) {
        setJobs([])
        setHasAnalyzedResume(false)
        return
      }

      // Use the most recently uploaded resume
      const latestResume = resumes[0]

      const matchResponse = await getJobMatches(latestResume.id)

      const formattedJobs = (matchResponse.jobs || []).map((job) => ({
        ...job,
        color: "bg-indigo-100 text-indigo-700",
        posted:
          job.postedDaysAgo === 0
            ? "Today"
            : `${job.postedDaysAgo} days ago`,
        workplace: job.location || "Not specified",
        applicationUrl:
          job.source === "Demo data" ||
          job.applyUrl?.includes("example.com")
            ? null
            : job.applyUrl,
        reason: `Matched skills: ${(job.matchedSkills || []).join(", ") || "None"}`,
        breakdown: [],
        responsibilities: [],
        requirements: [],
      }))

      setJobs(formattedJobs)
      setHasAnalyzedResume(true)
    } catch (error) {
      console.error("Failed to load job matches:", error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  loadJobMatches()
}, [])
    // Load local demo preferences.
    useEffect(() => {
        try {
            const saved = JSON.parse(
                localStorage.getItem("resumeai_saved_jobs") || "[]"
            )
            const savedStatuses = JSON.parse(
                localStorage.getItem("resumeai_job_statuses") || "{}"
            )

            setSavedJobs(Array.isArray(saved) ? saved : [])
            setStatuses(savedStatuses && typeof savedStatuses === "object" ? savedStatuses : {})
        } catch {
            setSavedJobs([])
            setStatuses({})
        }
    }, [])

    function toggleSave(jobId) {
        setSavedJobs((previous) => {
            const next = previous.includes(jobId)
                ? previous.filter((id) => id !== jobId)
                : [...previous, jobId]

            localStorage.setItem("resumeai_saved_jobs", JSON.stringify(next))
            return next
        })
    }

    function updateStatus(jobId, status) {
        setStatuses((previous) => {
            const next = { ...previous, [jobId]: status }
            localStorage.setItem("resumeai_job_statuses", JSON.stringify(next))
            return next
        })
    }

    const filteredJobs = useMemo(() => {
        let result = jobs.filter((job) => {
            const term = search.trim().toLowerCase()

            const matchesSearch =
                !term ||
                job.title.toLowerCase().includes(term) ||
                job.company.toLowerCase().includes(term) ||
                job.location.toLowerCase().includes(term) ||
                job.matchedSkills.some((skill) =>
                    skill.toLowerCase().includes(term)
                )

            const matchesQuality =
                quality === "All" ||
                (quality === "90%+ Match" && job.match >= 90) ||
                (quality === "80%+ Match" && job.match >= 80)

            return matchesSearch && matchesQuality
        })

        result = [...result].sort((a, b) => {
            if (sortBy === "date") {
                return a.postedDaysAgo - b.postedDaysAgo
            }

            return b.match - a.match
        })

        return result
    }, [jobs, search, quality, sortBy])

    const appliedCount = Object.values(statuses).filter(
        (status) => status === "Applied"
    ).length

    const savedCount = savedJobs.length

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">

            <main className="min-w-0 flex-1">
                {/* Header */}
                <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                                Job Matches
                            </h1>
                            <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                                Discover opportunities aligned with your skills and career goals.
                            </p>
                        </div>

                        <button
                            type="button"
                            aria-label="Notifications"
                            className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
                        >
                            <Bell size={19} />
                        </button>
                    </div>
                </header>

                <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
                    {/* Intro banner */}
                    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white sm:p-8">
                        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                            <div className="max-w-xl">
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                                    <Sparkles size={14} />
                                    YOUR CAREER MATCH REPORT
                                </div>
                                <h2 className="text-2xl font-bold sm:text-3xl">
                                    Find your next opportunity.
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-indigo-100">
                                    Explore roles, understand your skill gaps, and focus on
                                    opportunities that fit your profile.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:min-w-64">
                                <div className="rounded-xl bg-white/10 p-3 text-center">
                                    <p className="text-2xl font-bold">{jobs.length}</p>
                                    <p className="mt-1 text-[11px] text-indigo-100">Matches</p>
                                </div>
                                <div className="rounded-xl bg-white/10 p-3 text-center">
                                    <p className="text-2xl font-bold">{savedCount}</p>
                                    <p className="mt-1 text-[11px] text-indigo-100">Saved</p>
                                </div>
                                <div className="rounded-xl bg-white/10 p-3 text-center">
                                    <p className="text-2xl font-bold">{appliedCount}</p>
                                    <p className="mt-1 text-[11px] text-indigo-100">Applied</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Demo / integration note */}
                    <div className="flex flex-col justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-white p-2 text-indigo-600">
                                <BrainCircuit size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Resume-based recommendations
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                    Demo data is shown here. Connect your analyzed resume and job
                                    matching API to calculate real scores.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/analyzer")}
                            className="shrink-0 text-left text-sm font-semibold text-indigo-700 hover:text-indigo-900 sm:text-right"
                        >
                            Analyze my resume →
                        </button>
                    </div>

                    {/* Empty state */}
                    {!hasAnalyzedResume ? (
                        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <FileSearch size={30} />
                            </div>
                            <h2 className="mt-5 text-xl font-bold">
                                Your job matches are waiting
                            </h2>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Upload and analyze your resume first. We'll use your skills and
                                experience to help match you with relevant opportunities.
                            </p>
                            <button
                                type="button"
                                onClick={() => navigate("/upload")}
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                <Upload size={17} />
                                Upload a resume
                            </button>
                        </section>
                    ) : (
                        <>
                            {/* Search and filter controls */}
                            <section className="space-y-4">
                                <div className="flex flex-col gap-3 lg:flex-row">
                                    <div className="relative flex-1">
                                        <Search
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                        <input
                                            type="search"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            placeholder="Search jobs, companies, locations, or skills..."
                                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 sm:flex-none">
                                            <SlidersHorizontal size={16} />
                                            <span className="whitespace-nowrap">Sort by</span>
                                            <select
                                                value={sortBy}
                                                onChange={(event) => setSortBy(event.target.value)}
                                                className="min-w-0 bg-transparent py-3 font-semibold text-slate-800 outline-none"
                                            >
                                                <option value="match">Best match</option>
                                                <option value="date">Newest</option>
                                            </select>
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => setShowFilters((value) => !value)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            <SlidersHorizontal size={16} />
                                            <span className="hidden sm:inline">Filters</span>
                                            <ChevronDown
                                                size={15}
                                                className={showFilters ? "rotate-180" : ""}
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {["All", "90%+ Match", "80%+ Match"].map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setQuality(item)}
                                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${quality === item
                                                    ? "bg-indigo-600 text-white shadow-sm"
                                                    : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
                                                }`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                    <span className="ml-auto text-xs text-slate-500">
                                        {filteredJobs.length} opportunities
                                    </span>
                                </div>

                                {showFilters && (
                                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
                                        <span className="text-sm font-semibold text-slate-700">
                                            Match quality
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            Use the match pills above to filter by score. Sorting
                                            changes the order of the results.
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setQuality("All")
                                                setSearch("")
                                                setSortBy("match")
                                            }}
                                            className="ml-auto text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                        >
                                            Clear filters
                                        </button>
                                    </div>
                                )}
                            </section>

                            {/* Job results */}
                            {loading ? (
                                <section className="grid gap-4 xl:grid-cols-2">
                                    {[1, 2, 3, 4].map((item) => (
                                        <div
                                            key={item}
                                            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                                        >
                                            <div className="flex gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-slate-200" />
                                                <div className="flex-1 space-y-3">
                                                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                                                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                                                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                                                </div>
                                            </div>
                                            <div className="mt-6 h-4 w-1/3 rounded bg-slate-200" />
                                            <div className="mt-3 flex gap-2">
                                                <div className="h-7 w-20 rounded-lg bg-slate-100" />
                                                <div className="h-7 w-24 rounded-lg bg-slate-100" />
                                                <div className="h-7 w-16 rounded-lg bg-slate-100" />
                                            </div>
                                            <div className="mt-6 h-10 rounded-lg bg-slate-100" />
                                        </div>
                                    ))}
                                </section>
                            ) : filteredJobs.length === 0 ? (
                                <section className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
                                    <Search size={30} className="mx-auto text-slate-300" />
                                    <h3 className="mt-4 font-bold">No matching jobs found</h3>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Try another keyword or clear your filters.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch("")
                                            setQuality("All")
                                        }}
                                        className="mt-4 text-sm font-semibold text-indigo-600"
                                    >
                                        Clear search and filters
                                    </button>
                                </section>
                            ) : (
                                <section className="grid items-start gap-4 xl:grid-cols-2">
                                    {filteredJobs.map((job) => (
                                        <JobCard
                                            key={job.id}
                                            job={job}
                                            saved={savedJobs.includes(job.id)}
                                            status={statuses[job.id]}
                                            onOpen={() => setSelectedJob(job)}
                                            onSave={() => toggleSave(job.id)}
                                            onStatusChange={(status) =>
                                                updateStatus(job.id, status)
                                            }
                                        />
                                    ))}
                                </section>
                            )}
                        </>
                    )}

                    <p className="pb-3 text-center text-xs text-slate-400">
                        ResumeAI · Career recommendations are for guidance. Always review
                        the original job listing before applying.
                    </p>
                </div>
            </main>

            {/* Job details drawer */}
            {selectedJob && (
                <div
                    className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedJob(null)
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="job-detail-title"
                        className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
                            <p className="text-sm font-semibold text-slate-500">
                                Job details
                            </p>
                            <button
                                type="button"
                                aria-label="Close job details"
                                onClick={() => setSelectedJob(null)}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 space-y-7 overflow-y-auto p-5 sm:p-7">
                            <div>
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold ${selectedJob.color}`}
                                    >
                                        {selectedJob.initials}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <MatchBadge score={selectedJob.match} />
                                        <h2
                                            id="job-detail-title"
                                            className="mt-3 text-2xl font-bold tracking-tight"
                                        >
                                            {selectedJob.title}
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {selectedJob.company}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-600">
                                    <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2">
                                        <MapPin size={14} />
                                        {selectedJob.location}
                                    </span>
                                    <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2">
                                        <BriefcaseBusiness size={14} />
                                        {selectedJob.type}
                                    </span>
                                    <span className="rounded-lg bg-slate-100 px-3 py-2">
                                        {selectedJob.workplace}
                                    </span>
                                </div>

                                <p className="mt-4 text-sm font-semibold text-slate-800">
                                    {selectedJob.salary || "Salary not specified"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
                                <div className="flex items-center gap-2 text-sm font-bold text-indigo-800">
                                    <Sparkles size={18} />
                                    Why this looks like a match
                                </div>
                                <p className="mt-3 text-sm leading-6 text-slate-700">
                                    {selectedJob.reason}
                                </p>
                                <div className="mt-5 space-y-4">
                                    {selectedJob.breakdown.map((item) => (
                                        <div key={item.label}>
                                            <div className="mb-2 flex justify-between gap-3 text-xs">
                                                <span className="text-slate-600">{item.label}</span>
                                                <span className="font-bold text-indigo-700">
                                                    {item.score}%
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-white">
                                                <div
                                                    className="h-full rounded-full bg-indigo-500"
                                                    style={{ width: `${item.score}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-4 text-[11px] leading-5 text-slate-500">
                                    Illustrative demo scores, not an actual AI assessment.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900">Job description</h3>
                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                    {selectedJob.description}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900">
                                    Key responsibilities
                                </h3>
                                <ul className="mt-3 space-y-2">
                                    {selectedJob.responsibilities.map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-2 text-sm leading-6 text-slate-600"
                                        >
                                            <CheckCircle2
                                                size={16}
                                                className="mt-1 shrink-0 text-emerald-600"
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900">
                                    Required qualifications
                                </h3>
                                <ul className="mt-3 space-y-2">
                                    {selectedJob.requirements.map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-2 text-sm leading-6 text-slate-600"
                                        >
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900">
                                    Your skills compared with this role
                                </h3>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {selectedJob.matchedSkills.map((skill) => (
                                        <SkillTag key={skill}>{skill}</SkillTag>
                                    ))}
                                    {selectedJob.missingSkills.map((skill) => (
                                        <SkillTag key={skill} missing>
                                            {skill}
                                        </SkillTag>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900">Application status</h3>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {["Saved", "Applied", "Not Interested"].map((status) => {
                                        const selected =
                                            (statuses[selectedJob.id] || "Not Interested") === status ||
                                            (status === "Saved" && savedJobs.includes(selectedJob.id))

                                        return (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => {
                                                    if (status === "Saved") {
                                                        if (!savedJobs.includes(selectedJob.id)) {
                                                            toggleSave(selectedJob.id)
                                                        }
                                                        updateStatus(selectedJob.id, "Saved")
                                                    } else {
                                                        updateStatus(selectedJob.id, status)
                                                        if (status === "Not Interested") {
                                                            setSelectedJob(null)
                                                        }
                                                    }
                                                }}
                                                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${selected
                                                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 border-t border-slate-200 bg-white p-5 sm:px-7">
                            <button
                                type="button"
                                onClick={() => toggleSave(selectedJob.id)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                {savedJobs.includes(selectedJob.id) ? (
                                    <BookmarkCheck size={17} />
                                ) : (
                                    <Bookmark size={17} />
                                )}
                                {savedJobs.includes(selectedJob.id) ? "Saved" : "Save Job"}
                            </button>

                            <a
                                href={selectedJob.applicationUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => updateStatus(selectedJob.id, "Applied")}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                Apply on job site
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    </section>
                </div>
            )}
        </div>
    )
}
