// seed.js - run with: node seed.js
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Please set MONGODB_URI env var');
  process.exit(1);
}

const seedPath = path.join(process.cwd(), 'mongo-adapter', 'seed.json');
if (!fs.existsSync(seedPath)) {
  console.error('seed.json not found');
  process.exit(1);
}

const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

async function run() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const collections = Object.keys(seed);
  for (const coll of collections) {
    const docs = seed[coll];
    const modelName = coll.charAt(0).toUpperCase() + coll.slice(1);
    try {
      const col = mongoose.connection.collection(coll);
      if (docs.length) {
        await col.insertMany(docs);
        console.log(`Inserted ${docs.length} into ${coll}`);
      }
    } catch (e) {
      console.error('Error inserting', e);
    }
  }
  await mongoose.disconnect();
  console.log('Done');
}

run().catch(e => { console.error(e); process.exit(1); });
