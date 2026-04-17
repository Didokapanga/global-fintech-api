import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import roleRoutes from './routes/role.routes.js';
import agenceRoutes from './routes/agence.routes.js';
import caisseRoutes from './routes/caisse.routes.js';
import mouvementRoutes from './routes/mouvement.routes.js';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './configs/swagger.js';

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(cors());
app.use(express.json());

app.use('/api/roles', roleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/agences', agenceRoutes);
app.use('/api/caisses', caisseRoutes);
app.use('/api/mouvements', mouvementRoutes);


export default app;