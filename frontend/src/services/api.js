
const API_BASE_URL = "http://127.0.0.1:8000"

// Must match the key your login page uses to save the token
const TOKEN_KEY = "token"

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

//register user
export async function registerUser(fullName, username, email, password) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: fullName,
        username: username,
        email: email,
        password: password,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || "Account registration failed")
  }

  return data
}

// Login user
export async function loginUser(email, password) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.detail || "Login failed"
    )
  }

  return data
}


// Upload resume
export async function uploadResume(file) {
  const token = localStorage.getItem("access_token")

  if (!token) {
    throw new Error("You are not logged in")
  }

  const formData = new FormData()

  formData.append("file", file)

  const response = await fetch(
    `${API_BASE_URL}/api/resumes/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.detail || "Resume upload failed"
    )
  }

  return data
}

export async function getMyResumes() {
  const token = localStorage.getItem("access_token")

  if (!token) {
    throw new Error("You are not logged in")
  }

  const response = await fetch(
    `${API_BASE_URL}/api/resumes/my-resumes`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to retrieve resumes"
    )
  }

  return data
}
export async function analyzeResume(resumeId) {
  const token = localStorage.getItem("access_token")

  if (!token) {
    throw new Error("You are not logged in")
  }

  const response = await fetch(
    `${API_BASE_URL}/api/resumes/${resumeId}/analyze`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || "Resume analysis failed")
  }

  return data
}

export async function getJobMatches(resumeId) {
  const token = localStorage.getItem("access_token")

  if (!token) {
    throw new Error("You are not logged in")
  }

  const response = await fetch(
    `${API_BASE_URL}/api/jobs/matches?resume_id=${resumeId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to retrieve job matches"
    )
  }

  return data
}

export async function getAIResumeAnalysis(resumeId) {
  const token = localStorage.getItem("access_token")

  if (!token) {
    throw new Error("You are not logged in")
  }

  const response = await fetch(
    `${API_BASE_URL}/api/ai/analyze/${resumeId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || "Failed to analyze resume with AI")
  }

  return data
}
async function authFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Request failed")
  }

  return res.status === 204 ? null : res.json()
}

export const getMe = () => authFetch("/api/auth/me")

export const updateProfile = (data) =>
  authFetch("/api/auth/profile", { method: "PUT", body: JSON.stringify(data) })

export const changePassword = (data) =>
  authFetch("/api/auth/password", { method: "PUT", body: JSON.stringify(data) })

export const deleteAccount = () =>
  authFetch("/api/auth/account", { method: "DELETE" })

export const deleteResume = (resumeId) =>
  authFetch(`/api/resume/${resumeId}`, { method: "DELETE" })
