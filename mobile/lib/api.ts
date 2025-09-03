import axios from 'axios';
import { useAuthStore } from "@/store/authStore"

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1', // 👈 use env var
});

// Request Interceptor → attach access token
api.interceptors.request.use(
    (config) => {
        const { accessToken ,refreshToken} = useAuthStore.getState();
        console.log("first refreshToken "+refreshToken)

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor → handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        console.log(error.response?.status)
        console.log(originalRequest._retry)
        // If token expired
        if (error.response?.status === 401  && !originalRequest._retry ) {
            originalRequest._retry = true;

            try {
                const { refreshToken } = useAuthStore.getState();
                console.log("SEcond refreshToken "+refreshToken)
                if (!refreshToken) throw new Error('No refresh token available');


                // Call refresh endpoint
                const resp = await axios.post(
                    `${process.env.EXPO_PUBLIC_API_URL}/user/refresh-token`,
                    { refreshToken }
                );
                console.log("refresh token resp: " , resp.data.data.accessToken);
                console.log(resp.data?.data?.accessToken)

                const newAccessToken = resp.data?.data?.accessToken;

                // ✅ Update Zustand
                useAuthStore.setState({ accessToken: newAccessToken });

                // ✅ Retry original request
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (err) {
                // Refresh failed → logout
                useAuthStore.getState().clearAuth();
            }
        }

        return Promise.reject(error);
    }
);

export default api;
