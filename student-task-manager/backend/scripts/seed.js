const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Change this to your registered email
const ADMIN_EMAIL = 'admin@test.com';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;

  // Update the user's role to admin
  const result = await db.collection('users').updateOne(
    { email: ADMIN_EMAIL },
    { $set: { role: 'admin' } }
  );

  if (result.modifiedCount > 0) {
    console.log(`✅ "${ADMIN_EMAIL}" is now an admin!`);
  } else if (result.matchedCount > 0) {
    console.log(`✅ "${ADMIN_EMAIL}" is already an admin.`);
  } else {
    console.log(`❌ No user found with email "${ADMIN_EMAIL}".`);
    console.log('   Register first, then re-run this script.');
    console.log('   Or edit ADMIN_EMAIL in scripts/seed.js to your email.');
  }

  // Show all users
  const users = await db.collection('users').find({}).toArray();
  if (users.length > 0) {
    console.log('\nAll registered users:');
    users.forEach(u => console.log(`  ${u.email} - Role: ${u.role}`));
  } else {
    console.log('\nNo users registered yet.');
  }

  await mongoose.disconnect();
  console.log('\nDone!');
}).catch(e => { console.error(e); process.exit(1); });
