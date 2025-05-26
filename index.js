// Importing required modules 
const express = require('express');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
require('dotenv').config();

// Import database connection and models
const db = require('./config/mongoose');

// Import flash middleware
const flashmiddleware = require('./config/flash');

// Import routes
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');
const adminApiRoutes = require('./routes/adminapi');

// Create an instance of an Express application
const app = express();

// Configure session
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_CONNECTION,
        ttl: 30 * 24 * 60 * 60, // 30 days in seconds
    })
});

// Use session middleware
app.use(sessionMiddleware);

// Configure EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', [
    path.join(__dirname, 'views'),
    path.join(__dirname, 'views/admin'),
    path.join(__dirname, 'views/user'),
    path.join(__dirname, 'views/layouts')
]);

// Configure static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/videofile', express.static(path.join(__dirname, 'videofile')));

// Use flash middleware
app.use(flash());
app.use(flashmiddleware.setflash);

// Configure handling form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use('/', adminRoutes);
app.use('/api', apiRoutes);
app.use('/admin/api', adminApiRoutes);

// Create HTTP server and integrate Socket.IO
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

// Configure CORS for Socket.IO if needed
const io = new Server(server, {
    cors: {
        origin: '*', // Adjust the origin as needed
        methods: ['GET', 'POST']
    }
});

require('./public/assets/js/socketHandler')(io);

// Start the server
const PORT = process.env.SERVER_PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
});
