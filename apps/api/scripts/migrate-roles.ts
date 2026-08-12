import mongoose from 'mongoose';
import { env } from '../src/config/env.js';

async function run() {
  console.warn('Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);
  console.warn('Connected.');

  console.warn('Migrating users missing roles to "user"...');
  
  const result = await mongoose.connection.collection('users').updateMany(
    { $or: [{ role: { $exists: false } }, { role: null }, { role: '' }] },
    { $set: { role: 'user' } }
  );

  console.warn(`Migration complete. Modified ${result.modifiedCount} documents.`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
