import UserService from '../service/UserManager.js';
import jwt from 'jsonwebtoken';

class SessionController {
    // Registrar usuario
    async registerUser(req, res) {
        const { username, password } = req.body;
        try {
            const existingUser = await UserService.getUserByUsername(username);
            if (existingUser) {
                return res.status(400).json({ message: 'Usuario ya existe' });
            }

            const newUser = await UserService.create(username, password);
            return res.status(201).json({ message: 'Usuario registrado con éxito', user: newUser });
        } catch (error) {
            return res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
        }
    }

    // Iniciar sesión de usuario
    async loginUser(req, res) {
        const { username, password } = req.body;
        const user = await UserService.authenticate(username, password);
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ message: 'Login exitoso', token });
    }
}

export default new SessionController();
