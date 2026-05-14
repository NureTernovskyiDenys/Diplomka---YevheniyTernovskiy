import { jwtDecode } from 'jwt-decode';

export const isAuthenticated = () => {
    const token = localStorage.getItem('token');

    if (!token) return false;

    try {
        const decoded = jwtDecode(token);

        // Check if token is expired (JWT exp is in seconds)
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            // Token expired, clear it
            localStorage.removeItem('token');
            return false;
        }

        return true;
    } catch (error) {
        // Invalid token format
        localStorage.removeItem('token');
        return false;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};

export const getUserObject = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        return jwtDecode(token);
    } catch (e) {
        return null;
    }
}
