import app from './app.js';
import { config } from './config/env.js';
import { logger } from './middlewares/logger.js';
import { prisma } from './config/prisma.js';
import { cronService } from './services/cron.service.js';

async function main() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`API docs available at http://localhost:${config.port}/api-docs`);
      
      // Start automated match syncing
      cronService.startAutomatedMatchSync();
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

main();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
console.log('GEMINI_KEY_SET:', !!process.env.GEMINI_API_KEY);
