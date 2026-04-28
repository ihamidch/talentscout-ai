const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const rawAuth = req.header('Authorization') || req.header('authorization') || '';
    const parts = rawAuth.split(' ');
    const token = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1].trim() : null;

    if (!token) {
        return res.status(401).json({
            message: 'No token, authorization denied',
            code: 'NO_TOKEN',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (err) {
        const isExpired = err && err.name === 'TokenExpiredError';
        return res.status(401).json({
            message: isExpired ? 'Session expired, please login again' : 'Token is not valid',
            code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
        });
    }
};

module.exports = auth;
