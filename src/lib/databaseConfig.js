import { readFileSync } from 'node:fs';

const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'db']);
const SSL_QUERY_PARAMETERS = ['sslmode', 'ssl', 'sslcert', 'sslkey', 'sslrootcert'];

function readCertificate(env) {
    if (env.DATABASE_CA_CERT) {
        return env.DATABASE_CA_CERT.replaceAll('\\n', '\n');
    }

    const certificatePath = env.DATABASE_CA_CERT_PATH || env.PGSSLROOTCERT;
    return certificatePath ? readFileSync(certificatePath, 'utf8') : undefined;
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

    const ca = readCertificate(env);
    return {
        connectionString: url.toString(),
        ssl: {
            rejectUnauthorized: true,
            servername: url.hostname,
            ...(ca ? { ca } : {}),
        },
    };
}
