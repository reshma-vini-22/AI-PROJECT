import { Link } from "react-router-dom"

function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

       <div className="text-center mb-8">

  {/* Logo + Brand */}
  <div className="flex items-center justify-center gap-3">
    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-lg font-bold shadow-lg shadow-indigo-200">
      AI
    </div>

    <h1 className="text-3xl font-bold text-slate-900">
      ResumeAI
    </h1>
  </div>

  <p className="mt-3 text-slate-500">
    Analyze your resume. Find better opportunities.
  </p>

</div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50">

          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Sign in to continue to your dashboard.
          </p>

          <form className="mt-6 space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-200 transition hover:from-indigo-600 hover:to-violet-700 hover:shadow-xl"
            >
              Sign in
            </button>

          </form>

          {/* Signup */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline"
            >
              Create one
            </Link>
          </p>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          AI-powered resume analysis & job matching
        </p>

      </div>
    </div>
  )
}

export default LoginPage