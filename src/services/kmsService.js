const crypto = require('crypto');

class KMSService {
    constructor() {
        // Generate a secure key from SESSION_SECRET
        const secret = process.env.SESSION_SECRET || 'your-secret-key';
        this.key = crypto.scryptSync(secret, 'salt', 32);
        this.algorithm = 'aes-256-gcm';
    }

    async encryptData(data) {
        try {
            const iv = crypto.randomBytes(12);
            const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
            
            let encryptedData = cipher.update(JSON.stringify(data), 'utf8', 'hex');
            encryptedData += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            // Combine IV, encrypted data, and auth tag
            return iv.toString('hex') + ':' + encryptedData + ':' + authTag.toString('hex');
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    async decryptData(encryptedValue) {
        try {
            const [ivHex, encryptedData, authTagHex] = encryptedValue.split(':');
            
            const iv = Buffer.from(ivHex, 'hex');
            const authTag = Buffer.from(authTagHex, 'hex');
            
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
            decipher.setAuthTag(authTag);
            
            let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
            decryptedData += decipher.final('utf8');
            
            return JSON.parse(decryptedData);
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }
}

module.exports = new KMSService();