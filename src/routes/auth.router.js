import express from 'express';
import User from '../models/user.js'; 
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = 'tu_clave_secreta'; 


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        user.token = token;
        await user.save();

        res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
});


router.get('/current', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password -token'); 
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Token no válido' });
    }
});

export default router;
