const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;

  // Only delete tasks, keep all users
  const delTasks = await db.collection('tasks').deleteMany({});
  console.log('Deleted tasks:', delTasks.deletedCount);
  console.log('Users are NOT deleted - keeping all registered users.');

  const users = await db.collection('users').find({}).toArray();
  console.log('Current users:', users.map(u => `${u.email} (${u.role})`).join(', ') || 'none');

  await mongoose.disconnect();
  console.log('Done! Project is clean (tasks cleared, users kept).');
}).catch(e => { console.error(e); process.exit(1); });
