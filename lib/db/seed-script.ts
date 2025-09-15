import 'dotenv/config';
import { seedDatabase } from './seed';

async function main() {
  try {
    console.log('Starting database seeding...');
    await seedDatabase();
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

main();