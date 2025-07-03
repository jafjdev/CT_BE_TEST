import mongoose from 'mongoose';

let connection: typeof mongoose | null = null;

export async function connect(): Promise<typeof mongoose> {
  if (!connection) {
    connection = await mongoose.connect(
      process.env.DATABASE_URL || 'mongodb://localhost:27017/trainEngine',
    );
  }
  return connection;
}

export async function disconnect(): Promise<void> {
  if (connection) {
    await connection.disconnect();
    connection = null;
  }
}
