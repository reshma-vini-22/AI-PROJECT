import { useEffect, useState } from "react"
import {

  Upload,
  BriefcaseBusiness,

  FileText,
  CheckCircle,
} from "lucide-react"
import { getMyResumes, analyzeResume } from "../services/api"
function DashboardPage() {
  const [resumes, setResumes] = useState([])
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  const [resumeError, setResumeError] = useState("")
  const [selectedResume, setSelectedResume] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
  const handleAnalyzeResume = async (resume) => {
    try {
      setSelectedResume(resume)
      setAnalysis(null)
      setResumeError("")
      setIsAnalysisOpen(true)

      const result = await analyzeResume(resume.id)

      setAnalysis(result.analysis)
    } catch (error) {
      setResumeError(error.message)
    }
  }

  useEffect(() => {
    async function fetchResumes() {
      try {
        setIsLoadingResumes(true)

        const data = await getMyResumes()

        setResumes(data.resumes || [])
      } catch (error) {
        setResumeError(error.message)
      } finally {
        setIsLoadingResumes(false)
      }
    }

    fetchResumes()
  }, [])
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="px-6 md:px-10 pt-8 pb-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div>


            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>

            <p className="mt-2 text-slate-500">
              Here's an overview of your resume and job search.
            </p>
          </div>

          <button className="w-fit px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 hover:from-indigo-600 hover:to-violet-700 transition">
            + Upload Resume
          </button>

        </div>

      </header>

      <div className="px-6 md:px-10 pb-10">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Resume Score
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Overall resume quality
                </p>
              </div>

              {/* Donut Chart */}
              <div className="relative w-20 h-20">
                <svg
                  className="w-full h-full -rotate-90"
                  viewBox="0 0 100 100"
                >
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-100"
                  />

                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset="45.2"
                    className="text-indigo-500"
                  />
                </svg>

                {/* Score in the center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-900">
                    82%
                  </span>
                </div>
              </div>
            </div>


          </div>
          {/* Job Matches */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Job Matches
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  --
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 text-xl">
                <BriefcaseBusiness size={20} />
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              AI matching starts after analysis
            </p>

          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Skills Detected
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  --
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
                <FileText size={20} />
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              Extracted from your resume
            </p>

          </div>

          {/* Applications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Applications
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  --
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-xl">
                <CheckCircle size={20} />
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              Track your job applications
            </p>

          </div>

        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">

          {/* Resume Analysis */}
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="p-6 border-b border-slate-100">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Resume Analysis
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    AI-powered insights from your resume
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
                  AI Powered
                </span>

              </div>

            </div>

            <div className="p-6">

              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">

                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-indigo-200">
                  <Upload size={20} />
                </div>


                <p className="mt-2 max-w-md mx-auto text-sm text-slate-500">
                  Upload your PDF or DOCX resume and our AI will extract your
                  skills, experience, education and provide improvement suggestions.
                </p>

                <button className="mt-6 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition">
                  Analyze My Resume
                </button>

              </div>

            </div>

          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">

            <div className="p-6 border-b border-slate-100">

              <h2 className="text-lg font-bold text-slate-900">
                Quick Actions
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Get started with ResumeAI
              </p>

            </div>

            <div className="p-4 space-y-3">

              <button className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Upload size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Upload Resume
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      PDF or DOCX
                    </p>
                  </div>

                </div>

              </button>

              <button className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-violet-200 hover:bg-violet-50/50 transition">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                    <BriefcaseBusiness size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Find Job Matches
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Discover relevant jobs
                    </p>
                  </div>

                </div>

              </button>

              <button className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <FileText size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Improve Resume
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Get AI suggestions
                    </p>
                  </div>

                </div>

              </button>

            </div>

          </div>

        </div>
        {/* Recent Activity */}
        <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Recent Activity
            </h2>

            <span className="text-xs text-slate-400">
              Latest uploads
            </span>
          </div>

          <div className="p-6">
            {isLoadingResumes ? (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500">
                  Loading recent activity...
                </p>
              </div>
            ) : resumeError ? (
              <div className="text-center py-6">
                <p className="text-sm text-red-500">
                  {resumeError}
                </p>
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <FileText size={22} />
                </div>

                <p className="mt-4 text-sm font-medium text-slate-600">
                  No recent activity
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Upload your resume to see your activity here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {resumes.slice(0, 5).map((resume) => (
                  <div
                    key={resume.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {resume.filename}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Resume uploaded
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        {new Date(resume.uploaded_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                      <button
                        onClick={() => handleAnalyzeResume(resume)}
                        disabled={!resume.text_length || resume.text_length === 0}
                        className={`mt-3 rounded-lg px-4 py-2 text-sm font-medium text-white transition ${!resume.text_length || resume.text_length === 0
                          ? "cursor-not-allowed bg-slate-300"
                          : "bg-blue-600 hover:bg-blue-700"
                          }`}
                      >
                        {!resume.text_length || resume.text_length === 0
                          ? "Cannot Analyze"
                          : "Analyze Resume"}
                      </button>

                      <p className="text-xs text-slate-400 mt-1">
                        {resume.text_length} characters
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
{/* Premium Resume Analysis Popup */}
{isAnalysisOpen && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        setIsAnalysisOpen(false)
      }
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-analysis-title"
      className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-slate-900/20"
    >
      {/* Header */}
      <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-5 py-5 sm:px-8">
        <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              AI POWERED ANALYSIS
            </div>

            <h2
              id="resume-analysis-title"
              className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              Resume Insights
            </h2>

            <p className="mt-1 max-w-xl truncate text-sm text-slate-500">
              {selectedResume?.filename || "Your resume"}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close resume analysis"
            onClick={() => setIsAnalysisOpen(false)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-5 sm:p-8">
        {!analysis && !resumeError && (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
            <h3 className="mt-5 text-base font-semibold text-slate-800">
              Analyzing your resume
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Reviewing your skills, education, and experience...
            </p>
          </div>
        )}

        {resumeError && (
          <div className="rounded-2xl border border-red-200 bg-white p-6">
            <h3 className="font-semibold text-red-700">
              Analysis could not be completed
            </h3>
            <p className="mt-2 break-words text-sm text-slate-600">
              {resumeError}
            </p>
          </div>
        )}

        {analysis && (
          <div className="space-y-5">
            {/* Score Overview */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 sm:p-6">
                <div
                  className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#6366f1 ${Math.max(
                      0,
                      Math.min(100, Number(analysis.score) || 0)
                    )}%, #e2e8f0 0)`,
                  }}
                >
                  <div className="flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-2xl font-bold tracking-tight text-slate-900">
                      {analysis.score ?? 0}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      out of 100
                    </span>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-indigo-600">
                    Overall Resume Score
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">
                    Your resume assessment
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Review the findings below to identify strengths and
                    opportunities to improve your resume.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z"
                    />
                  </svg>
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-900">
                  {(analysis.skills || []).length}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Skills identified
                </p>
              </div>
            </div>

            {/* Skills */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    Technical Skills
                  </h3>
                  <p className="text-xs text-slate-500">
                    Skills extracted from your resume
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(analysis.skills || []).length > 0 ? (
                  analysis.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-sm font-medium text-indigo-700"
                    >
                      {typeof skill === "string"
                        ? skill
                        : skill.name || skill.skill || JSON.stringify(skill)}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No skills found.
                  </p>
                )}
              </div>
            </section>

            {/* Education, Experience, and Projects */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[
                {
                  title: "Education",
                  items: analysis.education,
                  empty: "No education details found.",
                },
                {
                  title: "Experience",
                  items: analysis.experience,
                  empty: "No experience details found.",
                },
                {
                  title: "Projects",
                  items: analysis.projects,
                  empty: "No projects found.",
                },
              ].map((section) => (
                <section
                  key={section.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="font-bold text-slate-900">
                    {section.title}
                  </h3>
                  <div className="mt-4 space-y-3">
                    {(section.items || []).length > 0 ? (
                      section.items.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600"
                        >
                          {typeof item === "string"
                            ? item
                            : item.degree ||
                              item.role ||
                              item.name ||
                              item.title ||
                              item.description ||
                              JSON.stringify(item)}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        {section.empty}
                      </p>
                    )}
                  </div>
                </section>
              ))}
            </div>

            {/* Strengths */}
            <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle size={20} />
                </div>
                <h3 className="font-bold text-slate-900">Strengths</h3>
              </div>

              <ul className="mt-4 space-y-3">
                {(analysis.strengths || []).length > 0 ? (
                  analysis.strengths.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>
                        {typeof item === "string"
                          ? item
                          : item.description ||
                            item.title ||
                            JSON.stringify(item)}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">
                    No strengths identified.
                  </li>
                )}
              </ul>
            </section>

            {/* Weaknesses */}
            <section className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-bold text-slate-900">
                Areas to Improve
              </h3>

              <ul className="mt-4 space-y-3">
                {(analysis.weaknesses || []).length > 0 ? (
                  analysis.weaknesses.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>
                        {typeof item === "string"
                          ? item
                          : item.description ||
                            item.title ||
                            JSON.stringify(item)}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">
                    No weaknesses identified.
                  </li>
                )}
              </ul>
            </section>

            {/* Suggestions */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-bold text-slate-900">
                Recommended Improvements
              </h3>

              <ul className="mt-4 space-y-3">
                {(analysis.suggestions || []).length > 0 ? (
                  analysis.suggestions.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                      <span>
                        {typeof item === "string"
                          ? item
                          : item.description ||
                            item.title ||
                            JSON.stringify(item)}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">
                    No suggestions available.
                  </li>
                )}
              </ul>
            </section>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:px-8">
        <p className="hidden text-xs text-slate-400 sm:block">
          ResumeAI · Resume insights
        </p>
        <button
          type="button"
          onClick={() => setIsAnalysisOpen(false)}
          className="ml-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200/70 transition hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-100"
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
