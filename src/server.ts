import dotenv from 'dotenv';

dotenv.config();

import app from './app.js';
import { db } from './database/connection.js';

console.log('PORT ENV:', process.env.PORT);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await db.query('SELECT 1');
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

startServer();