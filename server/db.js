const mongoose = require("mongoose");

/**
 * Reuse one connection across Vercel serverless invocations (avoids "buffering timed out").
 */
let cached = global.__talentscout_mongoose;
if (!cached) {
  cached = global.__talentscout_mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (!process.env.MONGO_URI) {
    const err = new Error(
      "MONGO_URI is not set. Add it in Vercel → Project → Settings → Environment Variables.",
    );
    err.code = "NO_MONGO_URI";
    throw err;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    };
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
