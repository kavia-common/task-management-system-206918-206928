const cors = require('cors');
const express = require('express');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

// Initialize express app
const app = express();

function parseCsvEnv(name) {
  const raw = process.env[name];
  if (!raw) return null;
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : null;
}

const allowedOrigins = parseCsvEnv('ALLOWED_ORIGINS');
const allowedMethods = parseCsvEnv('ALLOWED_METHODS') || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
const allowedHeaders = parseCsvEnv('ALLOWED_HEADERS') || ['Content-Type', 'Authorization'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (no Origin header)
    if (!origin) return callback(null, true);

    // If env not set, fallback to permissive (matches previous behavior)
    if (!allowedOrigins) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: allowedMethods,
  allowedHeaders,
  maxAge: Number(process.env.CORS_MAX_AGE || 0) || undefined,
}));

app.set('trust proxy', (process.env.TRUST_PROXY || '').toLowerCase() === 'true' ? 1 : true);

app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host'); // may or may not include port
  let protocol = req.protocol; // http or https

  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');

  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
     (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      {
        url: `${protocol}://${fullHost}`,
      },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Parse JSON request body
app.use(express.json());

// Mount routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

module.exports = app;

