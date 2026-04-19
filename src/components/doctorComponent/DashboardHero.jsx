import {FiActivity, FiCalendar, FiUsers, FiRefreshCw} from "react-icons/fi"
import { Link } from 'react-router-dom'

const DashboardHero = ({ greeting, displayName, todayLabel, stats, initials , role ,load ,loading}) => {
    return (

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl bg-linear-to-r from-[#274760] via-[#33597A] to-[#4A7BA4] text-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center shadow-sm">
                            <FiActivity size={20} />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-white/70">{greeting()}</p>
                            <h2 className="text-xl font-semibold leading-snug">Dr. {displayName}</h2>
                            <p className="text-xs mt-1 text-white/80">
                                Today is <span className="font-medium">{todayLabel}</span>. Here's your practice overview.
                            </p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs">
                        <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-semibold">
                            {initials}
                        </div>
                        <span className="uppercase tracking-[0.18em] text-white/80">{role}</span>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                    {[
                        { label: "Today", value: stats?.todayCount ?? "—" },
                        { label: "Pending", value: stats?.pendingCount ?? "—" },
                        { label: "Patients", value: stats?.totalPatients ?? "—" },
                    ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl bg-white/10 border border-white/10 px-3 py-2">
                            <p className="uppercase tracking-[0.18em] text-[10px] text-white/70">{label}</p>
                            <p className="mt-1 text-lg font-semibold">{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <Link to="/doctor/appointments"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3 hover:border-[#274760]/40 hover:shadow-sm transition">
                    <span className="h-9 w-9 rounded-xl bg-[#274760]/10 text-[#274760] flex items-center justify-center shrink-0">
                        <FiCalendar size={18} />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-[#274760]">Appointments</p>
                        <p className="text-[11px] text-gray-500">Manage all appointment requests</p>
                    </div>
                </Link>
                <Link to="/doctor/profile"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3 hover:border-[#274760]/40 hover:shadow-sm transition">
                    <span className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FiUsers size={18} />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-[#274760]">My Profile</p>
                        <p className="text-[11px] text-gray-500">Update availability & details</p>
                    </div>
                </Link>
                <button onClick={load} disabled={loading}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3 hover:border-[#274760]/40 hover:shadow-sm transition disabled:opacity-60 text-left w-full">
                    <span className="h-9 w-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                        <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-slate-700">Refresh</p>
                        <p className="text-[11px] text-gray-500">Reload dashboard data</p>
                    </div>
                </button>
            </div>
        </section>


    )
}

export default DashboardHero