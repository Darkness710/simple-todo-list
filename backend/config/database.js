const { MongoClient } = require('mongodb');

let client;
let db;

async function connectDB() {
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  db = client.db(process.env.DB_NAME);
  await db.command({ ping: 1 });

  console.log('MongoDB Atlas berhasil terhubung');
  return db;
}

function getDB() {
  if (!db) {
    throw new Error('Database belum terhubung');
  }

  return db;
}

module.exports = { connectDB, getDB };