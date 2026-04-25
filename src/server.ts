import 'dotenv/config';

import app from './app.js';
import { db } from './database/connection.js';

const PORT = Number(process.env.PORT) || 3000;

/**
 * =========================================
 * 🔥 UNCAUGHT EXCEPTION
 * =========================================
 */
process.on(
  'uncaughtException',
  (err: Error) => {
    console.error(
      '❌ UNCAUGHT EXCEPTION:',
      err
    );
  }
);

/**
 * =========================================
 * 🔥 UNHANDLED REJECTION
 * =========================================
 */
process.on(
  'unhandledRejection',
  (reason: unknown) => {
    console.error(
      '❌ UNHANDLED REJECTION:',
      reason
    );
  }
);

/**
 * =========================================
 * 🚀 START SERVER
 * =========================================
 */
async function startServer() {
  try {
    /**
     * test connexion DB
     */
    await db.query('SELECT 1');

    console.log(
      '✅ Database connected'
    );

    /**
     * start express
     */
    app.listen(
      PORT,
      '0.0.0.0',
      () => {
        console.log(
          `🚀 Server running on port ${PORT}`
        );
      }
    );

  } catch (error: unknown) {
    console.error(
      '❌ Database connection failed:',
      error
    );

    process.exit(1);
  }
}

startServer();