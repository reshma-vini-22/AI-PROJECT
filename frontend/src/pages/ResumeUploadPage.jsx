import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  FileUp,
  Layers,
  LayoutDashboard,
  Lightbulb,
  LoaderCircle,
  ScanText,
  Sparkles,
  Target,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import {
  uploadResume,
  getMyResumes,
  getResume,
  deleteResume,
} from "../services/api"

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

// Returns an error message, or an empty string if the file is valid
function validateFile(file) {
  const isPdfOrDocx =
    ALLOWED_TYPES.includes(file.type) || /\.(pdf|docx)$/i.test(file.name)

  if (!isPdfOrDocx) return "Please select a PDF or DOCX file."
  if (file.size > MAX_SIZE) return "File size must be less than 5 MB."
  return ""
}

function formatDate(value) {
  if (!value) return "Date unavailable"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unavailable"
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

const TIPS = [
  {
    icon: Layers,
    title: "List your skills clearly",
    text: "Include languages, frameworks, and tools. Skills are what job matching uses.",
  },
  {
    icon: ScanText,
    title: "Use a text-based file",
    text: "Scanned images can't be read. Export your resume directly from Word or Google Docs.",
  },
  {
    icon: Lightbulb,
    title: "Add your projects",
    text: "Academic, internship, and personal projects give the analyzer more to work with.",
  },
]

const STEPS = [
  { title: "Upload", text: "Add your PDF or DOCX resume." },
  { title: "Analyze", text: "Get a score, skills, and next steps." },
  { title: "Match", text: "See jobs that fit your profile." },
]

function ResumeViewer({ resume, data, loading, error, onClose }) {
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-viewer-title"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Resume text</p>
            <h2 id="resume-viewer-title" className="mt-1 truncate text-lg font-bold text-slate-900">
              {resume.filename}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-6">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <LoaderCircle size={16} className="animate-spin" />
              Loading resume...
            </div>
          )}

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {data && (
            data.text_content ? (
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-700">
                {data.text_content}
              </pre>
            ) : (
              <p className="text-sm text-slate-500">
                No readable text was extracted from this file. Upload a text-based PDF or DOCX.
              </p>
            )
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function ResumeUploadPage() {
  const navigate = useNavigate()

  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const [resumes, setResumes] = useState([])
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  const [listError, setListError] = useState("")
  const [listNotice, setListNotice] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const [viewing, setViewing] = useState(null)
  const [viewData, setViewData] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState("")

  async function loadResumes() {
    setIsLoadingResumes(true)
    setListError("")
    try {
      const data = await getMyResumes()
      setResumes(data.resumes || [])
    } catch (err) {
      setListError(err.message || "Could not load your resumes.")
    } finally {
      setIsLoadingResumes(false)
    }
  }

  useEffect(() => {
    loadResumes()
  }, [])

  // Clear the success notice after a few seconds
  useEffect(() => {
    if (!listNotice) return
    const timer = setTimeout(() => setListNotice(null), 3000)
    return () => clearTimeout(timer)
  }, [listNotice])

  function chooseFile(file) {
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      return
    }

    setError("")
    setSuccessMessage("")
    setSelectedFile(file)
  }

  function handleFileChange(event) {
    chooseFile(event.target.files[0])
    event.target.value = "" // lets the user pick the same file again after removing it
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    if (isUploading) return
    chooseFile(event.dataTransfer.files[0])
  }

  function removeFile() {
    setSelectedFile(null)
    setError("")
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please select a resume first.")
      return
    }

    setIsUploading(true)
    setError("")
    setSuccessMessage("")

    try {
      await uploadResume(selectedFile)
      setSuccessMessage("Resume uploaded successfully.")
      setSelectedFile(null)
      await loadResumes()
    } catch (uploadError) {
      setError(uploadError.message || "Resume upload failed.")
    } finally {
      setIsUploading(false)
    }
  }

  async function handleView(resume) {
    setViewing(resume)
    setViewData(null)
    setViewError("")
    setViewLoading(true)
    try {
      const data = await getResume(resume.id)
      setViewData(data)
    } catch (err) {
      setViewError(err.message || "Could not load this resume.")
    } finally {
      setViewLoading(false)
    }
  }

  function closeViewer() {
    setViewing(null)
    setViewData(null)
    setViewError("")
  }

  async function handleDelete(resume) {
    setDeletingId(resume.id)
    setListNotice(null)
    try {
      await deleteResume(resume.id)
      setResumes((prev) => prev.filter((item) => item.id !== resume.id))
      setListNotice({ type: "success", text: `"${resume.filename}" was deleted.` })
    } catch (err) {
      setListNotice({ type: "error", text: err.message || "Could not delete this resume." })
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-900 px-6 pb-28 pt-10 md:px-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300">
            <Sparkles size={13} />
            UPLOAD
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Add your resume
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
            Upload a PDF or DOCX. We read it to find your skills, experience, and the jobs that fit you.
          </p>
        </div>
      </section>

      {/* MAIN */}
      <main className="relative mx-auto -mt-16 grid max-w-7xl items-start gap-6 px-6 pb-12 md:px-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          {/* Upload card */}
          <section className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">Choose a file</h2>
            <p className="mt-1 text-sm text-slate-500">Use an up-to-date version of your resume.</p>

            <div className="mt-6">
              {!selectedFile ? (
                <label
                  htmlFor="resume-file"
                  onDragOver={(event) => {
                    event.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
                    isDragging
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/40"
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                    <FileUp size={28} />
                  </div>
                  <p className="mt-5 font-semibold text-slate-900">
                    {isDragging ? "Drop your resume here" : "Drag your resume here"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    or <span className="font-semibold text-emerald-600">browse your files</span>
                  </p>
                  <p className="mt-4 text-xs text-slate-400">PDF or DOCX · up to 5 MB</p>

                  <input
                    id="resume-file"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="sr-only"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <FileText size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{selectedFile.name}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={isUploading}
                    aria-label="Remove selected file"
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-rose-500 disabled:opacity-50"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div role="status" className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2 text-sm text-emerald-800">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  <span>{successMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  Go to dashboard
                  <ArrowRight size={15} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload resume
                </>
              )}
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              Your resume is used only for analysis and job matching.
            </p>
          </section>

          {/* Manage resumes */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Your resumes</h2>
                <p className="mt-1 text-sm text-slate-500">View, analyze, or delete the resumes you have uploaded.</p>
              </div>
              {resumes.length > 0 && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {resumes.length}
                </span>
              )}
            </div>

            {listNotice && (
              <div
                role="status"
                className={`mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
                  listNotice.type === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-800"
                }`}
              >
                {listNotice.type === "error" ? (
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                )}
                <span>{listNotice.text}</span>
              </div>
            )}

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
              <div className="rounded-xl border-2 border-dashed border-slate-200 px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <FileText size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-700">No resumes uploaded yet</p>
                <p className="mt-1 text-xs text-slate-400">Your uploaded resumes will appear here.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {resumes.map((resume) => {
                  const isReady = Number(resume.text_length) > 0
                  const isConfirming = confirmId === resume.id
                  const isDeleting = deletingId === resume.id

                  return (
                    <li
                      key={resume.id}
                      className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{resume.filename}</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock size={12} />
                            {formatDate(resume.uploaded_at)}
                            {isReady ? (
                              <span>· {resume.text_length} characters</span>
                            ) : (
                              <span className="text-amber-600">· No readable text</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {isConfirming ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Delete this resume?</span>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            disabled={isDeleting}
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(resume)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                          >
                            {isDeleting && <LoaderCircle size={14} className="animate-spin" />}
                            Delete
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleView(resume)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye size={15} />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate("/resume-analyzer")}
                            disabled={!isReady}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                          >
                            <Target size={15} />
                            Analyze
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(resume.id)}
                            aria-label={`Delete ${resume.filename}`}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">How it works</h2>
            <ol className="mt-5 space-y-5">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    {index < STEPS.length - 1 && <span className="mt-1 h-full w-px bg-slate-200" />}
                  </div>
                  <div className="pb-1">
                    <p className="font-semibold text-slate-900">{step.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6">
            <h2 className="font-bold text-slate-900">Tips for better results</h2>
            <ul className="mt-4 space-y-4">
              {TIPS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                    <Icon size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="mt-0.5 text-sm leading-5 text-slate-600">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-300 hover:shadow-sm"
          >
            <span className="flex items-center gap-3">
              <LayoutDashboard size={18} className="text-slate-500" />
              <span className="text-sm font-semibold text-slate-900">Back to dashboard</span>
            </span>
            <ArrowRight size={16} className="text-slate-400" />
          </button>
        </aside>
      </main>

      {viewing && (
        <ResumeViewer
          resume={viewing}
          data={viewData}
          loading={viewLoading}
          error={viewError}
          onClose={closeViewer}
        />
      )}
    </div>
  )
}

export default ResumeUploadPage