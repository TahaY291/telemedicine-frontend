import React from "react";

const ErrorBanner = ({error}) => {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <FiAlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
        </div>
    );
};

export default ErrorBanner;
