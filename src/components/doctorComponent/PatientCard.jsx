const PatientCard = ({ patient, onClick }) => {
    const name = patient?.user?.username || "Patient";
    const initials = name.split(" ").filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join("") || "P";
    const gender = patient?.personalInfo?.gender;
    const city = patient?.personalInfo?.address?.city;
    const blood = patient?.medicalInfo?.bloodGroup;

    return (
        <button
            onClick={onClick}
            className="w-full text-left group rounded-2xl border border-slate-200 bg-white hover:border-[#274760]/30 hover:shadow-md transition-all duration-200 overflow-hidden"
        >
            <div className="h-1 w-full bg-linear-to-r from-[#274760] to-[#3a7ca5] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#274760]/8 flex items-center justify-center shrink-0 text-[#274760] font-bold text-sm">
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        {gender && (
                            <span className="text-[11px] text-slate-400 font-medium capitalize">{gender}</span>
                        )}
                        {city && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                <FiMapPin size={9} /> {city}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {blood && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                            <FiDroplet size={9} /> {blood}
                        </span>
                    )}
                    <div className="flex items-center gap-1.5">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-medium">Last visit</p>
                            <p className="text-[11px] font-bold text-slate-600">{fmt(patient?.lastVisit)}</p>
                        </div>
                        <FiChevronRight size={14} className="text-slate-300 group-hover:text-[#274760] transition-colors" />
                    </div>
                </div>
            </div>
            <div className="px-4 pb-3 flex items-center gap-3 border-t border-slate-50">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <FiCalendar size={10} className="text-slate-400" />
                    {patient?.totalVisits || 0} visit{patient?.totalVisits !== 1 ? "s" : ""}
                </span>
                {patient?.medicalInfo?.allergies?.length > 0 && (
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600">
                        <FiAlertCircle size={10} />
                        Has allergies
                    </span>
                )}
                {patient?.medicalInfo?.chronicDiseases?.length > 0 && (
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-red-500">
                        <FiActivity size={10} />
                        Chronic conditions
                    </span>
                )}
            </div>
        </button>
    );
};

export default PatientCard