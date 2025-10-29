const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const skinDiseasesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/skin_diseases.json'), 'utf8')
);
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    const collection = mongoose.connection.collection('skin_diseases');
    await collection.deleteMany({});
    await collection.insertMany(skinDiseasesData.diseases);
    console.log('✅ Data imported successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  }); 