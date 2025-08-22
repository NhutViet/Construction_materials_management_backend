import { MongooseModuleOptions } from '@nestjs/mongoose';

export const databaseConfig: MongooseModuleOptions = {
  uri: 'mongodb+srv://viethcnps40580:nhutviet250705@crm.bglcm8v.mongodb.net/CRM?retryWrites=true&w=majority&appName=crm',
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
