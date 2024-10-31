import { Router } from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import { registerUser, loginUser, getCurrentUser } from '../controllers/session.controller.js';

const router = Router();

// Registro de usuario
router.post('/register', registerUser);

// Inicio de sesión
router.post('/login', loginUser);

// Obtener datos del usuario actual
router.get('/current', authenticateToken, getCurrentUser);

export default router;
