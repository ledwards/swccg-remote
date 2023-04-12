import ApiClient from './api/client';
import * as dotenv from 'dotenv'
dotenv.config();

const baseUrl = process.env.GEMP_SERVER_URL;
const apiClient = new ApiClient(baseUrl);

console.log('Starting SWCCG Remote.');
console.log(`Targeting gemp server at: ${baseUrl}.`);

apiClient.getHeartbeat().then((heartbeat) => console.log(heartbeat));
