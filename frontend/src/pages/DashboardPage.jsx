
import {
  
  Upload,
  BriefcaseBusiness,
  
  FileText,
  CheckCircle,
} from "lucide-react"
function DashboardPage() {
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

                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  Your resume hasn't been analyzed yet
                </h3>

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

          <div className="p-6 border-b border-slate-100">

            <h2 className="text-lg font-bold text-slate-900">
              Recent Activity
            </h2>

          </div>

          <div className="p-8 text-center">

            <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
              ◷
            </div>

            <p className="mt-4 text-sm font-medium text-slate-600">
              No recent activity
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Your resume analysis and job matching activity will appear here.
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default DashboardPage

