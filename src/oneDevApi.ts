import * as https from 'https';
import * as http from 'http';

export interface OneDevProject {
  id: number;
  name: string;
  path: string;
  description?: string;
}

export function fetchProjects(baseUrl: string, username: string, token: string): Promise<OneDevProject[]> {
  return new Promise((resolve, reject) => {
    let parsed: URL;
    try {
      parsed = new URL(`${baseUrl}/~api/projects?offset=0&count=50`);
    } catch (e) {
      reject(new Error(`Invalid server URL: ${baseUrl}`));
      return;
    }

    const lib = parsed.protocol === 'https:' ? https : http;
    const auth = Buffer.from(`${username}:${token}`).toString('base64');

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      rejectUnauthorized: false
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}