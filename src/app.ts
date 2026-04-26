import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import roleRoutes from './routes/role.routes.js';
import agenceRoutes from './routes/agence.routes.js';
import caisseRoutes from './routes/caisse.routes.js';
import mouvementRoutes from './routes/mouvement.routes.js';
import transfertRoutes from './routes/transfert.routes.js';
import transfertClientRoutes from './routes/transfertClient.routes.js';
import clientRoutes from './routes/client.routes.js';
import retraitRoutes from './routes/retrait.routes.js';
import validationRoutes from './routes/validation.routes.js';
import clotureRoutes from './routes/clotureCaisse.routes.js';
import ledgerRoutes from './routes/ledger.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './configs/swagger.js';

const app = express();

/**
 * =========================================
 * SWAGGER
 * =========================================
 */
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

/**
 * =========================================
 * CORS ORIGINS
 * =========================================
 */
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

/**
 * =========================================
 * MIDDLEWARES
 * =========================================
 */
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

app.use(express.json());

/**
 * =========================================
 * ROUTES API
 * =========================================
 */
app.use('/api/roles', roleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/agences', agenceRoutes);
app.use('/api/caisses', caisseRoutes);
app.use('/api/mouvements', mouvementRoutes);
app.use('/api/transferts', transfertRoutes);
app.use('/api/transfert-client', transfertClientRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/retraits', retraitRoutes);
app.use('/api/validations', validationRoutes);
app.use('/api/clotures', clotureRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/dashboard', dashboardRoutes);

export default app;