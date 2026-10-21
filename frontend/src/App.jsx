
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"

import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import DashboardPage from "./pages/DashboardPage"
import AppLayout from "./components/AppLayout"
import ProtectedRoute from "./components/ProtectedRoute"
import ResumeUploadPage from "./pages/ResumeUploadPage"
import JobMatchesPage from "./pages/JobMatchesPage"
import AiAnalyser from "./pages/AiAnalyser"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Main Application */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/resume-upload" element={<ResumeUploadPage />} />
            <Route path="/job-matches" element={<JobMatchesPage />} />
            <Route path="/resume-analyzer" element={<AiAnalyser />} />
          </Route>
        </Route>

        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />


      </Routes>
    </BrowserRouter>
  )
}

export default App
