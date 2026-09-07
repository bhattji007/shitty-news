import { PrismaClient } from '@prisma/client';

// Next's dev server reloads constantly. Without this, every reload opens a new
// connection pool and the database slowly fills with my ghosts.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
