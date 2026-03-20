const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('\n❌ MONGODB_URI is not set in .env file');
      console.log('\n📝 Please follow these steps:');
      console.log('1. Go to https://cloud.mongodb.com');
      console.log('2. Create a free cluster');
      console.log('3. Get your connection string');
      console.log('4. Add it to backend/.env file\n');
      process.exit(1);
    }

    // Check if using placeholder
    if (process.env.MONGODB_URI.includes('YOUR_USERNAME') || 
        process.env.MONGODB_URI.includes('cluster.mongodb.net') && 
        !process.env.MONGODB_URI.includes('@')) {
      console.error('\n❌ Please replace the placeholder MongoDB URI with your actual connection string');
      console.log('\n📝 Current URI:', process.env.MONGODB_URI);
      console.log('\nIt should look like:');
      console.log('mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/droplife?retryWrites=true&w=majority\n');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
    console.log('\n📝 Troubleshooting:');
    console.log('1. Check your MongoDB URI in .env file');
    console.log('2. Ensure your IP is whitelisted in MongoDB Atlas');
    console.log('3. Verify username and password are correct');
    console.log('4. Check if database user has proper permissions\n');
    process.exit(1);
  }
};

module.exports = connectDB;