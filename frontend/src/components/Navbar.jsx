
import { Link, useLocation ,useNavigate} from "react-router-dom"
import {
  LayoutDashboard,
  Upload,
  BriefcaseBusiness,
  Sparkles,
  Settings,
  LogOut,
  Menu,
} from "lucide-react"
import { useState } from "react"
function Navbar() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Upload Resume",
      path: "/resume-upload",
      icon: Upload,
    },
    {
      name: "Job Matches",
      path: "/job-matches",
      icon: BriefcaseBusiness,
    },
    {
      name: "AI Analyzer",
      path: "/resume-analyzer",
      icon: Sparkles,
    },
  ]
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")

    navigate("/login", { replace: true })
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed left-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-md md:hidden"
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileMenuOpen}
      >
        <Menu size={22} />
      </button>

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 flex-col bg-slate-950 text-white transition-transform duration-300 md:z-40 md:flex md:translate-x-0 ${isMobileMenuOpen
            ? "flex translate-x-0"
            : "hidden -translate-x-full md:flex"
          }`}
      >
        {/* Brand */}
        <div className="px-6 py-7">
          <Link to="/dashboard" className="flex items-center gap-3">

            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/40">
              <span className="font-bold">AI</span>
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                ResumeAI
              </h1>

              <p className="text-[11px] text-slate-500">
                Career Intelligence
              </p>
            </div>

          </Link>
        </div>

        {/* Navigation */}
        <div className="px-4 mt-4">

          <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </p>

          <div className="space-y-1">

            {navItems.map((item) => {
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${isActive
                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                >

                  <span className="w-6 text-center text-base">
                    <item.icon size={18} />
                  </span>

                  <span>
                    {item.name}
                  </span>

                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  )}

                </Link>
              )
            })}

          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-auto px-4 pb-5">

          <div className="border-t border-slate-800 pt-4">

            <button 
            type="button"
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition">
              <span className="w-6 text-center"><Settings size={20} /></span>
              Settings
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition"
            >
              <span className="w-6 text-center">
                <LogOut size={20} />
              </span>

              Logout
            </button>

          </div>

          {/* User */}
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-sm font-bold">
                U
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  User
                </p>

                <p className="text-xs text-slate-500 truncate">
                  Candidate
                </p>
              </div>

            </div>

          </div>

        </div>

      </aside>
    </>
  )
}

export default Navbar
