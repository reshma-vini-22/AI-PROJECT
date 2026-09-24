
const API_BASE_URL = "http://127.0.0.1:8000"


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