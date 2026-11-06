import { readFileSync } from 'node:fs';
import { SUPABASE_ROOT_CA } from './supabaseCa.js';

// TLS for remote databases: certificate verification is always on. A remote URL with
// sslmode=disable or sslmode=no-verify (or DATABASE_SSL_MODE set to either) is rejected, so remove
// that parameter from DATABASE_URL / POSTGRES_URL. Hosted Supabase is verified against the bundled
// root CA; for any other provider supply a trusted CA via DATABASE_CA_CERT (PEM, "\n" escapes
// allowed), DATABASE_CA_CERT_PATH or PGSSLROOTCERT. Local hosts below default to no TLS.
const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'db']);
const SSL_QUERY_PARAMETERS = ['sslmode', 'ssl', 'sslcert', 'sslkey', 'sslrootcert'];

function isSupabaseHost(hostname) {
    return hostname.endsWith('.supabase.com') || hostname.endsWith('.supabase.co');
}

function readCertificate(env, hostname) {
    if (env.DATABASE_CA_CERT) {
        return env.DATABASE_CA_CERT.replaceAll('\\n', '\n');
    }

    const certificatePath = env.DATABASE_CA_CERT_PATH || env.PGSSLROOTCERT;
    if (certificatePath) {
        return readFileSync(certificatePath, 'utf8');
    }

    // Hosted Supabase is verified against its published root CA when none is configured.
    return isSupabaseHost(hostname) ? SUPABASE_ROOT_CA : undefined;
}

export function getDatabaseConfig(env = process.env) {
    const connectionString = env.POSTGRES_URL || env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL or POSTGRES_URL must be set');
    }

    const url = new URL(connectionString);
    const isLocal = LOCAL_DATABASE_HOSTS.has(url.hostname);
    const requestedMode = (env.DATABASE_SSL_MODE || url.searchParams.get('sslmode') || '').toLowerCase();

    if ((requestedMode === 'disable' || requestedMode === 'no-verify') && !isLocal) {
        throw new Error('TLS certificate verification cannot be disabled for a remote database');
    }

    for (const parameter of SSL_QUERY_PARAMETERS) {
        url.searchParams.delete(parameter);
    }

    if (isLocal && requestedMode !== 'require' && requestedMode !== 'verify-ca' && requestedMode !== 'verify-full') {
        return { connectionString: url.toString(), ssl: false };
    }

    const ca = readCertificate(env, url.hostname);
    return {
        connectionString: url.toString(),
        ssl: {
            rejectUnauthorized: true,
            servername: url.hostname,
            ...(ca ? { ca } : {}),
        },
    };
}
