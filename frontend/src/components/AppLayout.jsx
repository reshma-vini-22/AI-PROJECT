
import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="md:ml-64">
        <Outlet />
      </main>

    </div>
  )
}

export default AppLayout

