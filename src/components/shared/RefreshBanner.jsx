import { FiRefreshCw } from 'react-icons/fi'

const RefreshBanner = ({ onClick, initialLoading, saving , tabName , text}) => {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{tabName}</h1>
                <p className="text-sm text-slate-400 mt-0.5">{text}</p>
            </div>
            <button
                onClick={onClick}
                disabled={initialLoading || saving}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
                <FiRefreshCw size={13} className={initialLoading ? "animate-spin" : ""} />
                Refresh
            </button>
        </div>
    )
}

export default RefreshBanner