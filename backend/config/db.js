const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows / local ISP DNS where Node's internal c-ares resolver fails SRV queries (querySrv ECONNREFUSED)
if (dns && typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (err) {
    // Graceful fallback if system restricts custom DNS servers
  }
}

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/daymark';

    // Safely interpolate username and password from environment if templated
    if (process.env.DB_USERNAME && process.env.DB_PASSWORD) {
      mongoUri = mongoUri
        .replace('<db_username>', encodeURIComponent(process.env.DB_USERNAME))
        .replace('<db_password>', encodeURIComponent(process.env.DB_PASSWORD));
    }

    const dbName = process.env.DB_NAME || 'daymark';
    const conn = await mongoose.connect(mongoUri, {
      dbName,
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Error] Failed to connect: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
