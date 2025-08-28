"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
exports.jwtConfig = {
    secret: process.env.JWT_SECRET || 'fallback-secret-key-for-development-only',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};
//# sourceMappingURL=jwt.config.js.map