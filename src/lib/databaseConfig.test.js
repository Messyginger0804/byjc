import { describe, expect, it } from 'vitest';
import { getDatabaseConfig } from './databaseConfig';

describe('getDatabaseConfig', () => {
    it('fails fast without a database URL', () => {
        expect(() => getDatabaseConfig({})).toThrow('DATABASE_URL or POSTGRES_URL must be set');
    });

    it('uses a practical non-TLS configuration for local PostgreSQL', () => {
        const config = getDatabaseConfig({ DATABASE_URL: 'postgresql://user:pass@localhost:5432/app' });
        expect(config.ssl).toBe(false);
    });

    it('verifies remote certificates and accepts a provider CA', () => {
        const config = getDatabaseConfig({
            POSTGRES_URL: 'postgresql://user:pass@db.example.com/app?sslmode=require',
            DATABASE_CA_CERT: '-----BEGIN CERTIFICATE-----\\nprovider-ca\\n-----END CERTIFICATE-----',
        });

        expect(config.connectionString).not.toContain('sslmode');
        expect(config.ssl).toMatchObject({
            rejectUnauthorized: true,
            servername: 'db.example.com',
            ca: '-----BEGIN CERTIFICATE-----\nprovider-ca\n-----END CERTIFICATE-----',
        });
    });

    it('refuses insecure TLS modes for remote PostgreSQL', () => {
        expect(() => getDatabaseConfig({
            DATABASE_URL: 'postgresql://user:pass@db.example.com/app?sslmode=no-verify',
        })).toThrow('TLS certificate verification cannot be disabled');
    });
});
