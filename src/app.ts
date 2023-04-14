import User from './user';

import ApiClient from './api/client';
import * as dotenv from 'dotenv'
dotenv.config();

const baseUrl = process.env.GEMP_SERVER_URL;
const apiClient = new ApiClient(baseUrl);

let user = new User();

async function main() {
  console.log('> Starting SWCCG Remote.');
  console.log(`> Targeting gemp server at: ${baseUrl}.\n`);

  await apiClient.getHeartbeat().then((response) => console.log(`Heartbeat: ${JSON.stringify(response)}`));

  await apiClient.postLogin('test', 'test')
    .then((response) => { user.id = response.userId; return response; })
    .then((response) => console.log(`Login: ${JSON.stringify(response)}`))
    .then((_) => console.log(`UserId: ${user.id}`));

  await apiClient.listDecks(user)
    .then((response) => console.log(`List Decks: ${JSON.stringify(response)}`));
}

main();
