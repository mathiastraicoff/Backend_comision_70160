import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1] || req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({ message: 'Token no válido' });
        }
        req.user = user;
        next();
    });
};

export default authenticateToken;
