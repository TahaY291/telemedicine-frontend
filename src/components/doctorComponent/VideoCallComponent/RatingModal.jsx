import { useState } from "react";
import api from "../../../api/axios";
import { FiAlertCircle, FiStar } from "react-icons/fi";

export const RatingModal = ({ appointmentId, doctorName, onDone }) => {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const submit = async () => {
        if (rating === 0) { setError("Please select a rating."); return; }
        setSubmitting(true); setError("");
        try {
            await api.post("/reviews/rate-doctor", { appointmentId, rating, comment: comment.trim() || undefined });
            onDone();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to submit review.");
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                <div className="h-1 bg-linear-to-r from-amber-400 to-orange-400" />
                <div className="p-6">
                    <h2 className="text-lg font-bold text-white text-center">Rate your consultation</h2>
                    <p className="text-sm text-slate-400 text-center mt-1">How was your experience with {doctorName}?</p>

                    <div className="flex items-center justify-center gap-2 my-6">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star}
                                onMouseEnter={() => setHovered(star)}
                                onMouseLeave={() => setHovered(0)}
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110">
                                <FiStar size={36} className={`transition-colors ${star <= (hovered || rating) ? "text-amber-400 fill-amber-400" : "text-slate-600"}`} />
                            </button>
                        ))}
                    </div>

                    {rating > 0 && (
                        <p className="text-center text-sm font-bold text-amber-400 -mt-3 mb-4">
                            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                        </p>
                    )}

                    <textarea value={comment} onChange={e => setComment(e.target.value)}
                        placeholder="Share your experience (optional)…" rows={3} maxLength={500}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 resize-none" />

                    {error && (
                        <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                            <FiAlertCircle size={11} />{error}
                        </p>
                    )}

                    <div className="flex gap-2 mt-4">
                        <button onClick={onDone}
                            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-xs font-semibold hover:bg-slate-800 transition-colors">
                            Skip
                        </button>
                        <button onClick={submit} disabled={submitting || rating === 0}
                            className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-400 disabled:opacity-60 transition-colors">
                            {submitting ? "Submitting…" : "Submit Review"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
