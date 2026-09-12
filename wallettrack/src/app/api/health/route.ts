import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { ok, route } from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liveness/readiness probe for load balancers and uptime monitors.
 *
 * Reports only whether the database answered - never the connection string,
 * driver internals, or error text, all of which would help an attacker
 * fingerprint the deployment.
 */
export const GET = route(async () => {
  const startedAt = Date.now();
  let database: "up" | "down" = "down";

  try {
    await connectDB();
    await mongoose.connection.db?.admin().ping();
    database = "up";
  } catch (error) {
    console.error("[health] Database ping failed", error);
  }

  return ok(
    {
      status: database === "up" ? "healthy" : "degraded",
      database,
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    { status: database === "up" ? 200 : 503 },
  );
});
