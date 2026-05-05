import { createContext, useContext, useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";

const LightboxContext = createContext(null);

export const LightboxProvider = ({ children }) => {
    const [image, setImage] = useState(null); // null = closed, url string = open

    const openLightbox = useCallback((url) => setImage(url), []);
    const closeLightbox = useCallback(() => setImage(null), []);

    // close on Escape key
    useEffect(() => {
        if (!image) return;
        const handleKey = (e) => { if (e.key === "Escape") closeLightbox(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [image, closeLightbox]);

    // prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = image ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [image]);

    // portal renders at document.body — above EVERYTHING
    const overlay = image
        ? ReactDOM.createPortal(
            <div
                onClick={closeLightbox}
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 9999,
                    backgroundColor: "rgba(0,0,0,0.85)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1rem",
                    cursor: "zoom-out",
                }}
            >
                {/* close button */}
                <button
                    onClick={closeLightbox}
                    style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(255,255,255,0.15)",
                        color: "#fff",
                        fontSize: "20px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                    }}
                >
                    ×
                </button>

                {/* image — click stops propagation so clicking image doesn't close */}
                <img
                    src={image}
                    alt="Full size preview"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        maxWidth: "90vw",
                        maxHeight: "90vh",
                        objectFit: "contain",
                        borderRadius: "8px",
                        cursor: "default",
                    }}
                />
            </div>,
            document.body
        )
        : null;

    return (
        <LightboxContext.Provider value={{ openLightbox, closeLightbox }}>
            {children}
            {overlay}
        </LightboxContext.Provider>
    );
};

export const useLightbox = () => {
    const ctx = useContext(LightboxContext);
    if (!ctx) throw new Error("useLightbox must be used inside LightboxProvider");
    return ctx;
};