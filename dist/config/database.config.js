"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required');
}
const uri = process.env.MONGODB_URI;
exports.databaseConfig = {
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
//# sourceMappingURL=database.config.js.map