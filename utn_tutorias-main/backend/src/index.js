require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/database');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// ── SEGURIDAD ─────────────────────────────
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - protección contra brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  message: { success: false, message: 'Demasiadas solicitudes. Intenta más tarde.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Demasiados intentos de inicio de sesión. Espera 15 minutos.' }
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

// ── BODY PARSING ──────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── IP LOGGING ────────────────────────────
app.use((req, res, next) => {
  req.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  next();
});

// ── RUTAS ─────────────────────────────────
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'UTN Tutorías API' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// ── INICIO ────────────────────────────────
const start = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n🎓 UTN Tutorías API corriendo en http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🔒 CORS habilitado para: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);
  });
};

start();
