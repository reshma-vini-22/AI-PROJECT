
import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="pt-16 md:ml-64 md:pt-0">
        <Outlet />
      </main>

    </div>
  )
}

export default AppLayout

