// ─── Skeleton ──────────────────────────────────────────────────────────────────

const SkeletonBlock = ({ w, h, r = "8px", extra = {} }) => (
  <div style={{ width: w, height: h, borderRadius: r, ...extra }} className="animate-pulse bg-slate-100 dark:bg-slate-200" />
);

const StatRowSkeleton = () => (
  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50">
    <SkeletonBlock w="32px" h="32px" r="8px" />
    <div className="flex flex-col gap-1.5 flex-1">
      <SkeletonBlock w="55px" h="10px" />
      <SkeletonBlock w="90px" h="13px" />
    </div>
  </div>
);

const DoctorProfileSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
    {/* Hero */}
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="h-1.5 bg-slate-100 animate-pulse" />
      <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <SkeletonBlock w="80px" h="80px" r="16px" extra={{ flexShrink: 0 }} />
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBlock w="180px" h="22px" />
            <SkeletonBlock w="90px" h="20px" r="999px" />
            <SkeletonBlock w="60px" h="20px" r="999px" />
          </div>
          <SkeletonBlock w="200px" h="14px" />
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock w="110px" h="30px" />
            <SkeletonBlock w="90px" h="30px" />
            <SkeletonBlock w="100px" h="30px" />
          </div>
        </div>
        <SkeletonBlock w="110px" h="36px" extra={{ flexShrink: 0 }} />
      </div>
    </div>

    {/* Three columns */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* Professional */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <SkeletonBlock w="32px" h="32px" r="8px" />
          <SkeletonBlock w="110px" h="18px" />
        </div>
        {[...Array(6)].map((_, i) => <StatRowSkeleton key={i} />)}
      </div>

      {/* Availability */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2.5">
        <div className="flex items-center gap-2 mb-1">
          <SkeletonBlock w="32px" h="32px" r="8px" />
          <SkeletonBlock w="100px" h="18px" />
          <SkeletonBlock w="50px" h="22px" r="999px" extra={{ marginLeft: "auto" }} />
        </div>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50">
            <div className="flex items-center gap-2">
              <SkeletonBlock w="14px" h="14px" r="50%" />
              <SkeletonBlock w="36px" h="13px" />
            </div>
            {i < 3 && <SkeletonBlock w="90px" h="13px" />}
          </div>
        ))}
      </div>

      {/* Documents */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <SkeletonBlock w="32px" h="32px" r="8px" />
          <SkeletonBlock w="90px" h="18px" />
        </div>
        {["Profile Photo", "Certificate"].map((label) => (
          <div key={label} className="space-y-2">
            <SkeletonBlock w="80px" h="11px" />
            <SkeletonBlock w="100%" h="144px" r="12px" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DoctorProfileSkeleton