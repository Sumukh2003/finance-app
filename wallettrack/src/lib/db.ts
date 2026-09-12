import mongoose from "mongoose";
import { env } from "@/lib/env";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

/**
 * The connection is cached on `globalThis` because Next.js hot-reloads modules
 * in development: without this, every edit would open a new connection pool and
 * eventually exhaust the server's connection limit.
 */
const globalCache = globalThis as typeof globalThis & {
  __wallettrackMongoose?: MongooseCache;
};

const cache: MongooseCache = (globalCache.__wallettrackMongoose ??= {
  conn: null,
  promise: null,
});

// Strip query operators from filter objects built out of user input.
mongoose.set("strictQuery", true);

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
      // Fail fast instead of queueing operations forever when the database is
      // unreachable — a hung request is worse than a clear error.
      bufferCommands: false,
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      maxPoolSize: 10,
      minPoolSize: 0,
      retryWrites: true,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    // Clear the rejected promise so the next request retries instead of
    // replaying the same failure for the lifetime of the process.
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}

export async function disconnectDB(): Promise<void> {
  if (!cache.conn) return;
  await mongoose.disconnect();
  cache.conn = null;
  cache.promise = null;
}
