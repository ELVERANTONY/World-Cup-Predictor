import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.roomMember.deleteMany();
  await prisma.room.deleteMany();
  await prisma.match.deleteMany();
  await prisma.stadium.deleteMany();
  await prisma.team.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = [
    { email: 'admin@worldcup.com', password: hashedPassword, name: 'Admin User', role: Role.ADMIN },
    { email: 'user1@example.com', password: hashedPassword, name: 'John Doe' },
    { email: 'user2@example.com', password: hashedPassword, name: 'Jane Smith' },
    { email: 'alice@example.com', password: hashedPassword, name: 'Alice Johnson' },
    { email: 'bob@example.com', password: hashedPassword, name: 'Bob Williams' },
  ];

  for (const userData of users) {
    await prisma.user.create({ data: userData });
  }
  console.log(`Created ${users.length} users`);

  // Create a default public room
  const admin = await prisma.user.findFirst({ where: { email: 'admin@worldcup.com' } })!;
  const room = await prisma.room.create({
    data: {
      name: 'World Cup 2026 - Global',
      code: 'WC2026',
      description: 'The official World Cup 2026 prediction room for everyone',
      createdById: admin!.id,
      isPublic: true,
      maxMembers: 100,
      members: {
        create: [
          { userId: admin!.id, role: 'ADMIN' },
          { userId: (await prisma.user.findFirst({ where: { email: 'user1@example.com' } }))!.id },
          { userId: (await prisma.user.findFirst({ where: { email: 'user2@example.com' } }))!.id },
          { userId: (await prisma.user.findFirst({ where: { email: 'alice@example.com' } }))!.id },
          { userId: (await prisma.user.findFirst({ where: { email: 'bob@example.com' } }))!.id },
        ],
      },
    },
  });
  console.log(`Created room: ${room.name} with code ${room.code}`);

  // Create achievements
  const achievements = [
    { name: 'First Prediction', description: 'Make your first prediction', iconUrl: '🎯', criteria: 'predictions:1' },
    { name: 'Perfect Score', description: 'Get an exact result (5 points)', iconUrl: '🏆', criteria: 'exact_result:1' },
    { name: 'Streak Master', description: 'Get 3 correct predictions in a row', iconUrl: '🔥', criteria: 'streak:3' },
    { name: 'High Roller', description: 'Score 10 points in a single prediction', iconUrl: '💯', criteria: 'max_points:10' },
    { name: 'Dedicated Follower', description: 'Make 10 predictions', iconUrl: '📊', criteria: 'predictions:10' },
    { name: 'Room Champion', description: 'Win a room ranking', iconUrl: '👑', criteria: 'room_winner:1' },
    { name: 'Early Bird', description: 'Predict 24+ hours before a match', iconUrl: '⏰', criteria: 'early_bird:1' },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.create({ data: achievement });
  }
  console.log(`Created ${achievements.length} achievements`);

  console.log('\n--- IMPORTANT ---');
  console.log('Run "Sync World Cup 2026" from the admin dashboard to load all teams,');
  console.log('stadiums, and 104 matches with real results from OpenFootball.');
  console.log('------------------\n');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
