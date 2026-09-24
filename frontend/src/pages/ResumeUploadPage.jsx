
import { useState } from "react"
import { FileUp, FileText, X } from "lucide-react"
import { uploadResume } from "../services/api"

function ResumeUploadPage() {
    const [selectedFile, setSelectedFile] = useState(null)
    const [error, setError] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")

    function handleFileChange(event) {
        const file = event.target.files[0]

        if (!file) {
            return
        }

        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]

        if (!allowedTypes.includes(file.type)) {
            setError("Please select a PDF or DOCX file.")
            setSelectedFile(null)
            return
        }

        const maxSize = 5 * 1024 * 1024

        if (file.size > maxSize) {
            setError("File size must be less than 5 MB.")
            setSelectedFile(null)
            return
        }

        setError("")
        setSelectedFile(file)
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
            setSuccessMessage(
                "Resume uploaded successfully!"
            )

            setSelectedFile(null)
        } catch (error) {
            setError(error.message || "Resume upload failed.")
        } finally {
            setIsUploading(false)
        }
    }


    return (
        <div className="min-h-screen bg-slate-50 px-6 py-8 md:px-10">
            <div className="mx-auto max-w-6xl">

                {/* Page Header */}
                <div className="mb-8">


                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Upload Your Resume
                    </h1>

                    <p className="mt-2 max-w-2xl text-slate-500">
                        Upload your resume to discover your skills, analyze your experience,
                        and find suitable job opportunities.
                    </p>
                </div>


                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Upload Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Choose a Resume
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Upload a clear and updated version of your resume.
                            </p>
                        </div>

                        {!selectedFile && (
                            <label
                                htmlFor="resume-file"
                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-14 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40"
                            >
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                    <FileUp size={30} />
                                </div>

                                <p className="font-semibold text-slate-700">
                                    Upload your resume
                                </p>

                                <p className="mt-2 text-sm text-slate-500">
                                    Click here to browse your files
                                </p>

                                <p className="mt-3 text-xs text-slate-400">
                                    PDF or DOCX • Maximum 5 MB
                                </p>

                                <input
                                    id="resume-file"
                                    type="file"
                                    accept=".pdf,.docx"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        )}

                        {selectedFile && (
                            <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 p-4">

                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600">
                                        <FileText size={22} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-slate-800">
                                            {selectedFile.name}
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="ml-4 rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-red-500"
                                    aria-label="Remove selected file"
                                >
                                    <X size={20} />
                                </button>

                            </div>
                        )}

                        {error && (
                            <p className="mt-4 rounded-lg bg-red-50 p-3 text-center text-white bg-red-600">
                                {error}
                            </p>
                        )}
                        {successMessage && (
                            <p className="mt-4 rounded-lg bg-green-50 p-3 text-center text-white bg-green-600">
                                {successMessage}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            {isUploading ? "Uploading..." : "Continue with Resume"}
                        </button>
                        <p className="mt-3 text-center text-xs text-slate-400">
                            Your resume will be used for analysis and job matching.
                        </p>

                    </div>

                    {/* Upload Tips */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                            <FileText size={22} />
                        </div>

                        <h2 className="text-lg font-semibold text-slate-900">
                            Resume Tips
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Follow these tips to get more useful analysis results.
                        </p>

                        <div className="mt-6 space-y-4">

                            <div>
                                <p className="font-medium text-slate-700">
                                    Keep your skills updated
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Include programming languages, frameworks, and tools you know.
                                </p>
                            </div>

                            <div>
                                <p className="font-medium text-slate-700">
                                    Use clear formatting
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Avoid complicated layouts that may affect text extraction.
                                </p>
                            </div>

                            <div>
                                <p className="font-medium text-slate-700">
                                    Mention your projects
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Add relevant academic, internship, and personal projects.
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

                {/* How It Works */}
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">
                            How ResumeAI Works
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Your journey from resume upload to job matching.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">

                        <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold text-white">
                                1
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-800">
                                    Upload
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Upload your resume in PDF or DOCX format.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold text-white">
                                2
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-800">
                                    Analyze
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Extract your skills, education, and experience.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold text-white">
                                3
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-800">
                                    Find Matches
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Compare your resume with relevant job descriptions.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>



            </div>
        </div>
    )
}

export default ResumeUploadPage