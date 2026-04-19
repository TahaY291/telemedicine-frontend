export const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export const getInitials = (name = "", fallback = "?") =>
    (name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("") || fallback;


export const getDisplayName = (user, fallback = "User") =>
    user?.username || fallback;


export const formatTime = (timeSlot) => timeSlot || "—";
