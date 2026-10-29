import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  AlertCircle,
  ArrowRight,
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react"
import { registerUser } from "../services/api"

const MIN_PASSWORD_LENGTH = 8

const BENEFITS = [
  "Get a score and clear feedback on your resume",
  "See your skills, experience, and projects extracted",
  "Find job matches that fit your profile",
]

const INITIAL_FORM = {
  full_name: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-900">{label}</label>
      <div className="relative">
        <Icon size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        {children}
      </div>
    </div>
  )
}

const inputClass =
  "w-full rounded-xl border-2 border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"

function SignupPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    const password = formData.password.trim()
    const confirmPassword = formData.confirmPassword.trim()

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter both fields.")
      return
    }

    setIsLoading(true)

    try {
      await registerUser(
        formData.full_name.trim(),
        formData.username.trim(),
        formData.email.trim(),
        password
      )
      navigate("/login")
    } catch (err) {
      setError(err.message || "Account registration failed.")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordTooShort =
    formData.password.length > 0 && formData.password.length < MIN_PASSWORD_LENGTH
  const passwordsMatch =
    formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword

  return (
    <div className="grid min-h-screen bg-slate-100 lg:grid-cols-2">
      {/* BRAND PANEL */}
      <section className="relative hidden overflow-hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-violet-500 text-sm font-bold shadow-lg">
            AI
          </div>
          <span className="text-xl font-bold tracking-tight">ResumeAI</span>
        </div>

        <div className="relative max-w-md">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300">
            <Sparkles size={13} />
            CREATE YOUR ACCOUNT
          </p>
          <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight">
            Build a stronger resume, one step at a time.
          </h2>
          <ul className="mt-8 space-y-4">
            {BENEFITS.map((text) => (
              <li key={text} className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={14} />
          Passwords are stored securely and never shown in plain text.
        </div>
      </section>

      {/* FORM PANEL */}
      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              AI
            </div>
            <span className="text-lg font-bold text-slate-900">ResumeAI</span>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10 sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500">It takes less than a minute.</p>

            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <Field label="Full name" icon={User}>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Username" icon={AtSign}>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  autoComplete="username"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Email address" icon={Mail}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className={inputClass}
                />
              </Field>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-900">Password</label>
                  <span className="text-xs text-slate-400">Min. {MIN_PASSWORD_LENGTH} characters</span>
                </div>
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pr-12 ${passwordTooShort ? "border-amber-300" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">Confirm password</label>
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pr-4 ${passwordsMatch ? "border-emerald-300" : ""}`}
                  />
                  {passwordsMatch && (
                    <CheckCircle2 size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                  )}
                </div>
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            AI-powered resume analysis and job matching
          </p>
        </div>
      </section>
    </div>
  )
}

export default SignupPage