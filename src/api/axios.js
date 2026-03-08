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
                window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;