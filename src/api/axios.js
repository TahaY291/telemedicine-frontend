import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

const REFRESH_ENDPOINT = "/users/refresh-token";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If no response or no status, just reject
        if (!error.response) {
            return Promise.reject(error);
        }

        // Don't try to refresh for the initial auth check itself
        if (originalRequest.url.includes("/users/is-authenticated")) {
            return Promise.reject(error);
        }

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes(REFRESH_ENDPOINT)
        ) {

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return api({
                            ...originalRequest,
                            headers: { ...originalRequest.headers },
                        });
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post(REFRESH_ENDPOINT);
                processQueue(null);
                return api({
                    ...originalRequest,
                    headers: { ...originalRequest.headers },
                });
            } catch (refreshError) {
                processQueue(refreshError);
                // No valid session: let caller / route guards handle redirect
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;