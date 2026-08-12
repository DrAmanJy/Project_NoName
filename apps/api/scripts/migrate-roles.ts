import mongoose from 'mongoose';
import { env } from '../src/config/env.js';

async function run() {
  console.warn('Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);
  console.warn('Connected.');

  console.warn('Migrating users missing roles to "user"...');
  
  const result = await mongoose.connection.collection('users').updateMany(
    { role: { $exists: false } },
    { $set: { role: 'user' } }
  );

  console.warn(`Migration complete. Modified ${result.modifiedCount} documents.`);
  await mongoose.disconnect();
}

run().catch(console.error);
