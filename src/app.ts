import User from './user';

import ApiClient from './api/client';
import * as dotenv from 'dotenv'
dotenv.config();

const baseUrl = process.env.GEMP_SERVER_URL;
const apiClient = new ApiClient(baseUrl);

let user = new User();
let adminUser = new User();
const deckName = 'Sample Deck';
const tableName = 'My Table';
const deckContents = '200_2,14_3,204_3,207_5,206_4,13_27,13_27,13_29,216_36,218_25,218_25,218_25,203_10,203_10,204_9,204_9,11_14,213_44,200_33,200_33,5_16,200_35,221_5,221_5,200_39,200_41,218_26,200_45,200_47,216_24,5_38,5_45,201_12,216_28,2_50,216_39,200_54,204_20,201_14,203_17,101_3,2_57,10_25,207_14,8_64,8_64,14_46,14_46,14_46,14_49,1_128,205_6,1_133,216_43,205_7,213_58,210_3,7_159,7_161,9_90|200_16,13_1,13_3,200_25,13_4,13_6,13_8,213_45,13_15,200_26,200_27,13_22,13_30,13_35,13_37,203_13,200_28,200_29,209_15,220_10,13_44,13_47,200_31,200_32,301_5';

// TODO: There should be a test file that runs all these functions.

async function main() {
  console.log('> Starting SWCCG Remote.');
  console.log(`> Targeting gemp server at: ${baseUrl}.\n`);

  await apiClient.getHeartbeat().then((response) => console.log(`Heartbeat: ${JSON.stringify(response)}`));

  await apiClient.postLogin(process.env.ADMIN_USER, process.env.ADMIN_PASSWORD)
    .then((response) => { adminUser.id = response.userId; return response; })
    .then((response) => console.log(`Admin Login: ${JSON.stringify(response)}`))

  await apiClient.startupServer(adminUser)
    .then((response) => console.log(`Startup Server: ${JSON.stringify(response)}`))

  await apiClient.postLogin('test', 'test')
    .then((response) => { user.id = response.userId; return response; })
    .then((response) => console.log(`User Login: ${JSON.stringify(response)}`))

  await apiClient.saveDeck(deckName, deckContents, user)
    .then((response) => console.log(`Save Deck: ${JSON.stringify(response)}`));

  await apiClient.getDeck(deckName, user)
    .then((response) => console.log(`Get Deck (${deckName}): ${JSON.stringify(response)}`));

  await apiClient.listDecks(user)
    .then((response) => console.log(`List Decks: ${JSON.stringify(response)}`));

  await apiClient.startGameSession(tableName, deckName, user)
    .then((response) => console.log(`Start Game Session: ${JSON.stringify(response)}`));

  await apiClient.getHall(user)
    .then((response) => { user.currentGame = response['waitingTables'][0]; return response })
    .then((response) => console.log(`Get Hall: ${JSON.stringify(response)}`));

  await apiClient.leaveTable(user.currentGame, user)
    .then((response) => console.log(`Leave Table: ${JSON.stringify(response)}`));

}

main();
