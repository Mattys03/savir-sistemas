// mongo-adapter/connection.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside Vercel or your environment.');
}

// Reuse existing connection across lambda invocations (Vercel serverless)
let cached = globalThis._mongoose;

if (!cached) {
  cached = globalThis._mongoose = { conn: null, promise: null };
}

async function connect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // other options can go here
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then(m => {
      return m.connection;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connect;
