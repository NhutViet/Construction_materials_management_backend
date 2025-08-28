import { MongooseModuleOptions } from '@nestjs/mongoose';

// Đảm bảo biến môi trường được load
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

const uri = process.env.MONGODB_URI as string;

export const databaseConfig: MongooseModuleOptions = {
  uri,
  connectionFactory: (connection) => {
    connection.on('connected', () => {
      console.log('🎉 MongoDB đã kết nối thành công!');
      console.log(`📊 Database: ${connection.name}`);
      console.log(`🔗 Connection String: ${connection.host}:${connection.port}`);
      console.log(`⏰ Connected at: ${new Date().toLocaleString('vi-VN')}`);
    });

    connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    connection.on('disconnected', () => {
      console.log('⚠️ MongoDB đã ngắt kết nối');
    });

    return connection;
  },
};
