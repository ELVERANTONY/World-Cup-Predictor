import { syncService } from './src/services/sync.service.js';

async function main() {
  console.log('Forcing match sync...');
  await syncService.syncFromOpenFootball();
  console.log('Sync finished!');
}

main().catch(console.error);
