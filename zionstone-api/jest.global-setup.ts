import { execSync } from 'child_process';

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://postgres:postgres@127.0.0.1:5433/zionstone_test';

export default function globalSetup() {
  try {
    execSync('bunx prisma db push --skip-generate', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    });
  } catch (error) {
    console.error('Failed to sync the Prisma schema to the test database:', error);
    process.exit(1);
  }
}
