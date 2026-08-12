import mongoose from 'mongoose';
import { env } from '../src/config/env.js';

async function run() {
  const emailArgs = process.argv.slice(2);
  if (emailArgs.length !== 1) {
    console.error('Usage: ts-node make-admin.ts <email>');
    process.exit(1);
  }
  
  const targetEmail = emailArgs[0].toLowerCase();

  console.warn('Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);
  console.warn('Connected.');

  console.warn(`Promoting user with email ${targetEmail} to admin...`);
  
  const result = await mongoose.connection.collection('users').findOneAndUpdate(
    { email: targetEmail },
    { $set: { role: 'admin' } },
    { returnDocument: 'after' }
  );

  if (!result) {
    console.error(`User with email ${targetEmail} not found!`);
    await mongoose.disconnect();
    process.exit(1);
  } else {
    console.warn(`Success! User ${targetEmail} is now an admin.`);
  }

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
