import User from '../models/user.js';  

class UserManager {
    // Método para crear un nuevo usuario
    async createUser(userData) {
        try {
            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                throw new Error('Ya existe un usuario con este correo electrónico');
            }

            // Crear un nuevo usuario
            const newUser = new User(userData);

            // Guardar el usuario en la base de datos
            const savedUser = await newUser.save();
            return savedUser;
        } catch (error) {
            throw new Error('Error al crear el usuario: ' + error.message);
        }
    }

    // Método para obtener un usuario por su ID
    async getUserById(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return user;
        } catch (error) {
            throw new Error('Error al buscar el usuario: ' + error.message);
        }
    }

    // Método para obtener un usuario por su correo electrónico
    async getUserByEmail(email) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return user;
        } catch (error) {
            throw new Error('Error al buscar el usuario por email: ' + error.message);
        }
    }

    // Método para autenticar usuario
    async authenticate(username, password) {
        const user = await User.findOne({ username });
        if (!user) {
            return null;  
        }
        const isMatch = await user.comparePassword(password);
        return isMatch ? user : null; 
    }

    // Método para actualizar la información de un usuario
    async updateUser(userId, updateData) {
        try {
            const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
            if (!updatedUser) {
                throw new Error('Usuario no encontrado');
            }
            return updatedUser;
        } catch (error) {
            throw new Error('Error al actualizar el usuario: ' + error.message);
        }
    }
}

export default new UserManager();
