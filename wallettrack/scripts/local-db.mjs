/**
 * Starts a throwaway MongoDB on localhost:27017 for local development.
 *
 * Useful when you have no MongoDB installed and no cloud cluster to point at.
 * Data lives in memory and is discarded when the process stops, so this is for
 * development only - never for anything you want to keep.
 *
 *   npm run dev:db      # leave running in one terminal
 *   npm run dev         # in another, with MONGODB_URI=mongodb://127.0.0.1:27017/wallettrack
 */
import { MongoMemoryServer } from "mongodb-memory-server";

const PORT = Number(process.env.LOCAL_DB_PORT ?? 27017);
const DB_NAME = process.env.LOCAL_DB_NAME ?? "wallettrack";

const server = await MongoMemoryServer.create({
  instance: { port: PORT, dbName: DB_NAME },
});

const uri = server.getUri(DB_NAME);

console.log("\n  Local MongoDB is running.\n");
console.log(`  MONGODB_URI=${uri}\n`);
console.log("  Data is in memory only and is lost when this process stops.");
console.log("  Press Ctrl+C to stop.\n");

async function shutdown() {
  await server.stop();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
