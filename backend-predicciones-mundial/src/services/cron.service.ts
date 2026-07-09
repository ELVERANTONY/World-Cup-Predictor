import cron from 'node-cron';
import { logger } from '../middlewares/logger.js';
import { rankingService } from './ranking.service.js';
import { syncService } from './sync.service.js';

class CronService {
  public startAutomatedMatchSync() {
    // Run every 30 minutes to avoid hitting GitHub API rate limits
    cron.schedule('*/30 * * * *', async () => {
      logger.info('Running real Match Sync job from OpenFootball...');
      try {
        await syncService.syncFromOpenFootball();
        await rankingService.recalculateAll();
        logger.info('Real Match Sync completed successfully.');
      } catch (error) {
        logger.error('Error during real Match Sync:', { error });
      }
    });
  }
}

export const cronService = new CronService();
