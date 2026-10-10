const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://postgres:postgres@127.0.0.1:5433/zionstone_test';

// Must run before any test module imports `@/lib/prisma`, whose PrismaClient
// reads DATABASE_URL lazily on first query.
process.env.DATABASE_URL = TEST_DATABASE_URL;
