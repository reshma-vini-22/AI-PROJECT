import { Navigate, Outlet } from "react-router-dom"

function ProtectedRoute() {
  const token = localStorage.getItem("access_token")

  console.log("ProtectedRoute is running")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}


export default ProtectedRoute