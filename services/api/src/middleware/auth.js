/**
 * Authentication Middleware
 */
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
export async function authenticate(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        // Set userId on request
        req.userId = decoded.userId;
        // Optional device ID from header
        req.deviceId = req.headers['x-device-id'];
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}
//# sourceMappingURL=auth.js.map