import ApiClient from './api/client';
import * as dotenv from 'dotenv'
dotenv.config();

const baseUrl = process.env.GEMP_SERVER_URL;
const apiClient = new ApiClient(baseUrl);

console.log('Starting SWCCG Remote.');
console.log(`Targeting gemp server at: ${baseUrl}.`);

apiClient.getHeartbeat().then((response) => console.log(`Heartbeat: ${JSON.stringify(response)}`));

apiClient.postLogin('test', 'test').then((response) => console.log(`Login: ${JSON.stringify(response)}`));
