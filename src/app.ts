import User from './user';

import ApiClient from './api/client';
import * as dotenv from 'dotenv'
dotenv.config();

const baseUrl = process.env.GEMP_SERVER_URL;
const apiClient = new ApiClient(baseUrl);

let lsPlayerUser = new User();
let dsPlayerUser = new User();
let adminUser = new User();
const lsDeckName = 'Obimuning';
const dsDeckName = 'Thrawn';
const tableName = 'My Table';
const lsDeckContents = '200_2,14_3,204_3,207_5,206_4,13_27,13_27,13_29,216_36,218_25,218_25,218_25,203_10,203_10,204_9,204_9,11_14,213_44,200_33,200_33,5_16,200_35,221_5,221_5,200_39,200_41,218_26,200_45,200_47,216_24,5_38,5_45,201_12,216_28,2_50,216_39,200_54,204_20,201_14,203_17,101_3,2_57,10_25,207_14,8_64,8_64,14_46,14_46,14_46,14_49,1_128,205_6,1_133,216_43,205_7,213_58,210_3,7_159,7_161,9_90|200_16,13_1,13_3,200_25,13_4,13_6,13_8,213_45,13_15,200_26,200_27,13_22,13_30,13_35,13_37,203_13,200_28,200_29,209_15,220_10,13_44,13_47,200_31,200_32,301_5';
const dsDeckContents = '9_96,200_73,213_1,9_98,10_33,217_6,208_30,200_81,219_7,10_40,200_82,200_82,200_86,2_107,208_38,12_131,201_29,1_218,1_218,200_107,5_120,200_110,1_222,1_222,4_127,219_16,208_41,219_20,209_47,200_120,10_39,102_8,219_9,1_249,9_137,9_137,9_137,9_137,9_139,200_123,3_138,12_163,12_163,12_163,12_163,12_164,2_146,1_288,219_10,219_11,219_13,219_1,219_2,201_41,211_24,217_4,13_56,215_23,200_140,216_3|13_51,200_93,13_52,13_54,13_61,13_63,216_5,200_94,13_66,220_2,213_13,13_68,200_95,200_97,200_98,13_72,13_78,13_81,13_84,13_86,13_90,200_99,13_96,13_95,13_98,13_99,200_100,13_100';

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

  await apiClient.postLogin('test1', 'test')
    .then((response) => { lsPlayerUser.id = response.userId; return response; })
    .then((response) => console.log(`User1 Login: ${JSON.stringify(response)}`))

  await apiClient.postLogin('test2', 'test')
    .then((response) => { dsPlayerUser.id = response.userId; return response; })
    .then((response) => console.log(`User2 Login: ${JSON.stringify(response)}`))

  await apiClient.saveDeck(lsDeckName, lsDeckContents, lsPlayerUser)
    .then((response) => console.log(`Save Deck (LS): ${JSON.stringify(response)}`));

  await apiClient.saveDeck(dsDeckName, dsDeckContents, dsPlayerUser)
    .then((response) => console.log(`Save Deck (DS): ${JSON.stringify(response)}`));

  await apiClient.getDeck(lsDeckName, lsPlayerUser)
    .then((response) => console.log(`Get Deck (${lsDeckName}): ${JSON.stringify(response)}`));

  await apiClient.listDecks(lsPlayerUser)
    .then((response) => console.log(`List Decks: ${JSON.stringify(response)}`));

  await apiClient.startGameSession(tableName, lsDeckName, lsPlayerUser)
    .then((response) => console.log(`Start Game Session: ${JSON.stringify(response)}`));

  await apiClient.getHall(lsPlayerUser)
    .then((response) => { lsPlayerUser.currentGame = response['waitingTables'][0]; return response })
    .then((response) => console.log(`Get Hall: ${JSON.stringify(response)}`));

  // await apiClient.leaveTable(lsPlayerUser.currentGame, lsPlayerUser)
  //   .then((response) => console.log(`Leave Table: ${JSON.stringify(response)}`));

  await apiClient.joinTable(lsPlayerUser.currentGame, dsDeckName, dsPlayerUser)
    .then((response) => console.log(`Join Table: ${JSON.stringify(response)}`));

}

main();
