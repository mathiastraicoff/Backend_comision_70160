import express from 'express'; 
import mongoose from 'mongoose';
import session from 'express-session';
import { engine } from 'express-handlebars';
import http from 'http';
import { Server } from 'socket.io';
import cartsRouter from './routes/carts.router.js';
import productsRouter from './routes/products.router.js';
import viewsRouter from './routes/views.router.js';
import path from 'path';
import { __dirname } from './utils.js';
import CartManager from './service/CartManager.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import sessionRouter from './routes/session.router.js';
import cors from 'cors';
import MongoStore from 'connect-mongo';
import methodOverride from 'method-override';
import authRouter from './routes/auth.router.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const cartManager = new CartManager(); 

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Conexión a MongoDB exitosa');
    })
    .catch((error) => {
        console.error('Error al conectar a MongoDB:', error);
    });

// Configuración de Handlebars
app.engine('handlebars', engine({
    layoutsDir: path.join(__dirname, 'views/layouts'),
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


// Middleware
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true
}));
app.use(cookieParser()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 1000
    }),
    secret: process.env.JWT_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true }
}));
app.use(methodOverride('_method')); 
app.use(passport.initialize());

// Rutas
app.use('/api/carts', cartsRouter);
app.use('/api/products', productsRouter);
app.use('/', viewsRouter);
app.use('/api/sessions', sessionRouter); 
app.use('/api/sessions', authRouter);

// Configuración de sockets
io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado:', socket.id);
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta protegida
app.get('/api/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ message: 'Acceso permitido', user: req.user });
});

// Iniciar el servidor
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${process.env.PORT}`);
});

