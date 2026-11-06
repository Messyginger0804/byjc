import { describe, expect, it } from 'vitest';
import { getDatabaseConfig } from './databaseConfig';

describe('getDatabaseConfig', () => {
    it('fails fast without a database URL', () => {
        expect(() => getDatabaseConfig({})).toThrow('DATABASE_URL or POSTGRES_URL must be set');
    });

    it('uses a practical non-TLS configuration for local PostgreSQL', () => {
        const config = getDatabaseConfig({ DATABASE_URL: 'postgresql://user@localhost:5432/app' });
        expect(config.ssl).toBe(false);
    });

    it('verifies remote certificates and accepts a provider CA', () => {
        const config = getDatabaseConfig({
            POSTGRES_URL: 'postgresql://user@db.example.com/app?sslmode=require',
            DATABASE_CA_CERT: '-----BEGIN CERTIFICATE-----\\nprovider-ca\\n-----END CERTIFICATE-----',
        });

        expect(config.connectionString).not.toContain('sslmode');
        expect(config.ssl).toMatchObject({
            rejectUnauthorized: true,
            servername: 'db.example.com',
            ca: '-----BEGIN CERTIFICATE-----\nprovider-ca\n-----END CERTIFICATE-----',
        });
    });

    it('verifies hosted Supabase against its bundled root CA when no CA is configured', () => {
        const config = getDatabaseConfig({
            POSTGRES_URL: 'postgres://user@aws-0-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require',
        });

        expect(config.ssl.rejectUnauthorized).toBe(true);
        expect(config.ssl.ca).toContain('BEGIN CERTIFICATE');
    });

    it('prefers a configured CA over the bundled Supabase CA', () => {
        const config = getDatabaseConfig({
            POSTGRES_URL: 'postgres://user@aws-0-us-east-2.pooler.supabase.com:6543/postgres',
            DATABASE_CA_CERT: 'custom-ca',
        });

        expect(config.ssl.ca).toBe('custom-ca');
    });

    it('does not add a CA for other remote hosts', () => {
        const config = getDatabaseConfig({ DATABASE_URL: 'postgresql://user@db.example.com/app' });
        expect(config.ssl.ca).toBeUndefined();
    });

    it('refuses insecure TLS modes for remote PostgreSQL', () => {
        expect(() => getDatabaseConfig({
            DATABASE_URL: 'postgresql://user@db.example.com/app?sslmode=no-verify',
        })).toThrow('TLS certificate verification cannot be disabled');
    });

    it('normalizes IPv6 brackets and hostname case for the local and Supabase checks', () => {
        expect(getDatabaseConfig({ DATABASE_URL: 'postgresql://user@[::1]:5432/app' }).ssl).toBe(false);
        expect(getDatabaseConfig({ DATABASE_URL: 'postgresql://user@LOCALHOST/app' }).ssl).toBe(false);

        const config = getDatabaseConfig({ DATABASE_URL: 'postgres://user@DB.SUPABASE.CO/postgres' });
        expect(config.ssl.ca).toContain('BEGIN CERTIFICATE');
        expect(config.ssl.servername).toBe('db.supabase.co');
    });
});
