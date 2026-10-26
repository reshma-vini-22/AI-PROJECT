import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  BellRing,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  Database,
  FileText,
  KeyRound,
  LoaderCircle,
  LogOut,
  MapPin,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  ShieldAlert,
  Sparkles,
  Trash2,
  User,
} from "lucide-react"
import {
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
  getMyResumes,
  deleteResume,
} from "../services/api"
import { getSettings, saveSettings, DEFAULT_SETTINGS, SETTINGS_KEY } from "../utils/settings"

// Update if your api.js stores the token under a different key
const TOKEN_KEY = "token"
const JOB_KEYS = ["resumeai_saved_jobs", "resumeai_job_statuses", "resumeai_jobs_last_visit"]

// Tabs whose changes are saved with the bottom "Save" bar (browser preferences)
const PREF_TABS = ["jobs", "ai", "notifications"]

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: KeyRound },
  { id: "jobs", label: "Job search", icon: BriefcaseBusiness },
  { id: "ai", label: "AI analysis", icon: Sparkles },
  { id: "notifications", label: "Notifications", icon: BellRing },
  { id: "resumes", label: "Resumes", icon: FileText },
  { id: "data", label: "Data", icon: Database },
  { id: "account", label: "Account", icon: ShieldAlert },
]

const inputClass =
  "w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:opacity-60"

// ---------- Shared pieces ----------

function Card({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  )
}

function Field({ label, htmlFor, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-slate-900">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

function ChoiceGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition ${
            value === option.value
              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
              : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-emerald-500 peer-focus:ring-4 peer-focus:ring-emerald-100" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

function Notice({ notice }) {
  if (!notice) return null
  const isError = notice.type === "error"
  return (
    <div
      role="status"
      className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
        isError ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-800"
      }`}
    >
      {isError ? (
        <CircleAlert size={16} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
      )}
      <span>{notice.text}</span>
    </div>
  )
}

// ---------- Tabs ----------

function ProfileTab({ user, onUserUpdated, onNotice }) {
  const [username, setUsername] = useState(user?.username || "")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setUsername(user?.username || "")
  }, [user?.username])

  if (!user) {
    return (
      <Card title="Profile" description="Your account details.">
        <p className="text-sm text-slate-500">
          Could not load your profile. Check that the backend is running.
        </p>
      </Card>
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const clean = username.trim()
    if (clean.length < 2) {
      onNotice({ type: "error", text: "Name must be at least 2 characters." })
      return
    }
    setSaving(true)
    try {
      const updated = await updateProfile({ username: clean })
      onUserUpdated(updated)
      onNotice({ type: "success", text: "Profile updated." })
    } catch (err) {
      onNotice({ type: "error", text: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Profile" description="Your name is shown across ResumeAI.">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field label="Display name" htmlFor="username">
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Email" htmlFor="email" hint="Email cannot be changed here.">
          <input id="email" value={user.email} disabled className={inputClass} />
        </Field>

        <button
          type="submit"
          disabled={saving || username.trim() === user.username}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving && <LoaderCircle size={15} className="animate-spin" />}
          Save profile
        </button>
      </form>
    </Card>
  )
}

function SecurityTab({ onNotice }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" })
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  async function handleSubmit(event) {
    event.preventDefault()

    if (form.next.length < 8) {
      onNotice({ type: "error", text: "New password must be at least 8 characters." })
      return
    }
    if (form.next !== form.confirm) {
      onNotice({ type: "error", text: "New passwords do not match." })
      return
    }
    if (form.next === form.current) {
      onNotice({ type: "error", text: "Choose a password different from your current one." })
      return
    }

    setSaving(true)
    try {
      await changePassword({ current_password: form.current, new_password: form.next })
      setForm({ current: "", next: "", confirm: "" })
      onNotice({ type: "success", text: "Password changed." })
    } catch (err) {
      onNotice({ type: "error", text: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Change password" description="Use at least 8 characters.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Current password" htmlFor="current-password">
          <input
            id="current-password"
            type="password"
            value={form.current}
            onChange={set("current")}
            className={inputClass}
            required
          />
        </Field>
        <Field label="New password" htmlFor="new-password">
          <input
            id="new-password"
            type="password"
            value={form.next}
            onChange={set("next")}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Confirm new password" htmlFor="confirm-password">
          <input
            id="confirm-password"
            type="password"
            value={form.confirm}
            onChange={set("confirm")}
            className={inputClass}
            required
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {saving && <LoaderCircle size={15} className="animate-spin" />}
          Update password
        </button>
      </form>
    </Card>
  )
}

function JobSearchTab({ draft, update }) {
  return (
    <Card title="Job search" description="Used for job matches and job site searches.">
      <div className="space-y-7">
        <Field label="Default location" htmlFor="default-location" hint="Used when you search job sites.">
          <div className="relative">
            <MapPin
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="default-location"
              value={draft.defaultLocation}
              onChange={(e) => update("defaultLocation", e.target.value)}
              placeholder="e.g. Chennai, Bangalore, Remote"
              className={`${inputClass} pl-11`}
            />
          </div>
        </Field>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">Preferred job site</p>
          <ChoiceGroup
            value={draft.jobSite}
            onChange={(v) => update("jobSite", v)}
            options={[
              { value: "linkedin", label: "LinkedIn" },
              { value: "indeed", label: "Indeed" },
              { value: "naukri", label: "Naukri" },
            ]}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">Minimum match score</p>
          <ChoiceGroup
            value={draft.minMatch}
            onChange={(v) => update("minMatch", v)}
            options={[
              { value: 0, label: "All matches" },
              { value: 60, label: "60% and above" },
              { value: 80, label: "80% and above" },
            ]}
          />
        </div>
      </div>
    </Card>
  )
}

function AiTab({ draft, update }) {
  return (
    <Card title="AI analysis" description="Controls how resumes are analyzed.">
      <div className="space-y-3">
        <Toggle
          checked={draft.useAiAnalysis}
          onChange={(v) => update("useAiAnalysis", v)}
          label="Use AI analysis"
          description="Use Gemini for deeper feedback. Turn this off to always use basic analysis."
        />
        <Toggle
          checked={draft.fallbackToBasic}
          onChange={(v) => update("fallbackToBasic", v)}
          label="Fall back to basic analysis"
          description="If AI is unavailable, show basic analysis and label it clearly."
        />
      </div>
    </Card>
  )
}

function NotificationsTab({ draft, update }) {
  return (
    <Card title="Notifications" description="Choose what ResumeAI shows you inside the app.">
      <div className="space-y-3">
        <Toggle
          checked={draft.emailAlerts}
          onChange={(v) => update("emailAlerts", v)}
          label="New job alerts"
          description="Show a banner when new jobs appear since your last visit."
        />
        <Toggle
          checked={draft.showSkillGaps}
          onChange={(v) => update("showSkillGaps", v)}
          label="Show skills to develop"
          description="Highlight skills a job lists that are missing from your resume."
        />
      </div>
    </Card>
  )
}

function ResumesTab({ onNotice }) {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState(null)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    getMyResumes()
      .then((data) => setResumes(data.resumes || []))
      .catch((err) => onNotice({ type: "error", text: err.message }))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id) {
    setBusyId(id)
    try {
      await deleteResume(id)
      setResumes((prev) => prev.filter((r) => r.id !== id))
      onNotice({ type: "success", text: "Resume deleted." })
    } catch (err) {
      onNotice({ type: "error", text: err.message })
    } finally {
      setBusyId(null)
      setConfirmId(null)
    }
  }

  return (
    <Card title="Your resumes" description="Delete resumes you no longer want analyzed or matched.">
      {loading ? (
        <p className="text-sm text-slate-500">Loading resumes...</p>
      ) : resumes.length === 0 ? (
        <p className="text-sm text-slate-500">No resumes uploaded yet.</p>
      ) : (
        <ul className="space-y-3">
          {resumes.map((resume) => (
            <li
              key={resume.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <FileText size={18} />
                </div>
                <p className="truncate text-sm font-semibold text-slate-900">{resume.filename}</p>
              </div>

              {confirmId === resume.id ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(resume.id)}
                    disabled={busyId === resume.id}
                    className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    {busyId === resume.id && <LoaderCircle size={14} className="animate-spin" />}
                    Yes, delete
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmId(resume.id)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function DataTab({ onClearJobs, onResetPrefs }) {
  return (
    <Card
      title="Data"
      description="Manage information stored in this browser. Your uploaded resumes are not affected."
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Clear saved jobs and activity</p>
            <p className="mt-0.5 text-xs text-slate-500">Removes saved jobs and your last-visit time.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Clear saved jobs and job activity?")) onClearJobs()
            }}
            className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
          >
            Clear
          </button>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Reset preferences</p>
            <p className="mt-0.5 text-xs text-slate-500">Restores every setting on this page to its default.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset all preferences to defaults?")) onResetPrefs()
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>
    </Card>
  )
}

function AccountTab({ onNotice, onLogout, onAccountDeleted }) {
  const [confirmText, setConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await deleteAccount()
      onAccountDeleted()
    } catch (err) {
      onNotice({ type: "error", text: err.message })
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Session" description="Log out of ResumeAI on this device.">
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <LogOut size={16} />
          Log out
        </button>
      </Card>

      <section className="rounded-2xl border border-rose-200 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-bold text-rose-700">Delete account</h2>
        <p className="mt-1 text-sm text-slate-500">
          This permanently deletes your account, uploaded resumes, and analysis results. It cannot be undone.
        </p>

        <div className="mt-6 space-y-4">
          <Field label='Type "DELETE" to confirm' htmlFor="delete-confirm">
            <input
              id="delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className={inputClass}
              placeholder="DELETE"
            />
          </Field>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={confirmText !== "DELETE" || deleting}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting && <LoaderCircle size={15} className="animate-spin" />}
            Delete my account
          </button>
        </div>
      </section>
    </div>
  )
}

// ---------- Main page ----------

export default function SettingsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState("profile")
  const [user, setUser] = useState(null)
  const [savedPrefs, setSavedPrefs] = useState(getSettings)
  const [draft, setDraft] = useState(getSettings)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    getMe().then(setUser).catch(() => setUser(null))
  }, [])

  // Hide success or error messages after a few seconds
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 3500)
    return () => clearTimeout(timer)
  }, [notice])

  const isPrefTab = PREF_TABS.includes(tab)
  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedPrefs)

  function update(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function savePrefs() {
    saveSettings(draft)
    setSavedPrefs(draft)
    setNotice({ type: "success", text: "Preferences saved." })
  }

  function discardPrefs() {
    setDraft(savedPrefs)
  }

  function resetPrefs() {
    saveSettings(DEFAULT_SETTINGS)
    setDraft({ ...DEFAULT_SETTINGS })
    setSavedPrefs({ ...DEFAULT_SETTINGS })
    setNotice({ type: "success", text: "Preferences reset to defaults." })
  }

  function clearJobData() {
    JOB_KEYS.forEach((key) => localStorage.removeItem(key))
    setNotice({ type: "success", text: "Saved jobs and activity cleared." })
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    navigate("/login")
  }

  function handleAccountDeleted() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(SETTINGS_KEY)
    JOB_KEYS.forEach((key) => localStorage.removeItem(key))
    navigate("/signup")
  }

  function renderTab() {
    switch (tab) {
      case "profile":
        return (
          <ProfileTab
            user={user}
            onUserUpdated={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
            onNotice={setNotice}
          />
        )
      case "security":
        return <SecurityTab onNotice={setNotice} />
      case "jobs":
        return <JobSearchTab draft={draft} update={update} />
      case "ai":
        return <AiTab draft={draft} update={update} />
      case "notifications":
        return <NotificationsTab draft={draft} update={update} />
      case "resumes":
        return <ResumesTab onNotice={setNotice} />
      case "data":
        return <DataTab onClearJobs={clearJobData} onResetPrefs={resetPrefs} />
      case "account":
        return (
          <AccountTab
            onNotice={setNotice}
            onLogout={logout}
            onAccountDeleted={handleAccountDeleted}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-900 px-6 pb-28 pt-10 md:px-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
          >
            <ArrowLeft size={15} />
            Back to dashboard
          </button>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300">
            <SettingsIcon size={13} />
            SETTINGS
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Account and preferences
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
            Manage your profile, security, job search, and saved data.
          </p>
        </div>
      </section>

      <main className="relative mx-auto -mt-16 grid max-w-7xl gap-6 px-6 pb-12 md:px-10 lg:grid-cols-[260px_1fr]">
        {/* Tab navigation */}
        <nav className="h-fit rounded-2xl bg-white p-3 shadow-xl shadow-slate-900/10 lg:sticky lg:top-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id)
                setNotice(null)
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                tab === id
                  ? "bg-slate-900 text-white"
                  : id === "account"
                  ? "text-rose-600 hover:bg-rose-50"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={17} />
              {label}
              {PREF_TABS.includes(id) && isDirty && (
                <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" title="Unsaved changes" />
              )}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="min-w-0 space-y-4">
          <Notice notice={notice} />
          {renderTab()}

          {isPrefTab && (
            <div className="sticky bottom-4 flex flex-col gap-3 rounded-2xl bg-slate-900 p-4 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-300">
                {isDirty ? "You have unsaved changes." : "All preferences are saved."}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!isDirty}
                  onClick={discardPrefs}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white disabled:opacity-40"
                >
                  Discard
                </button>
                <button
                  type="button"
                  disabled={!isDirty}
                  onClick={savePrefs}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-50 disabled:opacity-40"
                >
                  <Save size={15} />
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}