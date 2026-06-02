import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Create the Turso client only if environment variables are available
function createDBClient() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  // Check for missing, undefined, or invalid environment variables
  if (!url || !authToken || url === 'undefined' || authToken === 'undefined') {
    // Return a mock client for build-time when env vars are not available
    console.warn('Database environment variables not set. Using mock client.');
    return null;
  }

  try {
    return createClient({
      url,
      authToken,
    });
  } catch (error) {
    console.error('Failed to create database client:', error);
    return null;
  }
}

const client = createDBClient();

// Create the Drizzle database instance with conditional client
export const db = client ? drizzle(client, { schema }) : null;

// Export the client for direct access if needed
export { client };