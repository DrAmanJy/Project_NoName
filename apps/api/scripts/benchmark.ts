/* eslint-disable no-console */
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { User } from '../src/modules/auth/models/user.model.js';
import { sessionService } from '../src/modules/auth/session/session.service.js';

async function runBenchmark() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);

  // 1. Setup mock user and session
  console.log('Creating mock user and session...');
  const user = await User.create({
    name: 'Benchmark User',
    email: 'bench@example.com',
    isActive: true,
  });

  const sessionToken = await sessionService.createSession(user._id.toString());
  
  // 2. We need the API server to be running.
  // We assume the user has the API running on env.PORT
  const apiUrl = `http://localhost:${env.PORT}/api/v1/auth/me`;
  console.log(`Starting benchmark against ${apiUrl}`);

  const ITERATIONS = 1000;
  const latencies: number[] = [];

  // Warmup
  for (let i = 0; i < 50; i++) {
    await fetch(apiUrl, {
      headers: {
        cookie: `${env.AUTH_COOKIE_NAME}=${sessionToken}`,
      },
    });
  }

  // Benchmark loop
  for (let i = 0; i < ITERATIONS; i++) {
    const start = process.hrtime.bigint();
    
    const res = await fetch(apiUrl, {
      headers: {
        cookie: `${env.AUTH_COOKIE_NAME}=${sessionToken}`,
      },
    });
    
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    
    if (!res.ok) {
      console.error(`Request failed with status ${res.status}`);
      break;
    }
    
    // consume body
    await res.json();
    
    latencies.push(durationMs);
  }

  latencies.sort((a, b) => a - b);
  
  const p50 = latencies[Math.floor(ITERATIONS * 0.50)];
  const p95 = latencies[Math.floor(ITERATIONS * 0.95)];
  const p99 = latencies[Math.floor(ITERATIONS * 0.99)];
  const max = latencies[latencies.length - 1];

  console.log('\n--- Benchmark Results ---');
  console.log(`Iterations: ${ITERATIONS}`);
  console.log(`p50: ${p50.toFixed(2)} ms`);
  console.log(`p95: ${p95.toFixed(2)} ms`);
  console.log(`p99: ${p99.toFixed(2)} ms`);
  console.log(`max: ${max.toFixed(2)} ms`);

  // Cleanup
  await User.deleteOne({ _id: user._id });
  await mongoose.disconnect();
}

runBenchmark().catch(console.error);
