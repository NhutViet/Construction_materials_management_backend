import { MongooseModuleOptions } from '@nestjs/mongoose';

export const databaseConfig: MongooseModuleOptions = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/construction_materials_db',
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
