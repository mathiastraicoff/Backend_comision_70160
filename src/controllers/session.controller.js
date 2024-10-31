import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Registro de usuario
export const registerUser = async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword
        });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: 'Error al registrar usuario', error });
    }
};

// Inicio de sesión de usuario
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });


        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
            .status(200)
            .json({ message: 'Inicio de sesión exitoso', token }); 
    } catch (error) {
        res.status(400).json({ message: 'Error en el inicio de sesión', error });
    }
};

// Obtener datos del usuario logueado
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('first_name last_name email age');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el usuario', error });
    }
};
