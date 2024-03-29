import axios, { AxiosResponse } from 'axios';
import xml2js from 'xml2js';

import * as dotenv from 'dotenv';
import User from '../classes/user';
dotenv.config();
const baseUrl = process.env.GEMP_SERVER_URL;

// TODO: Responses are one interface (on AxiosResponse); return values per function are different
export interface HeartbeatResponse {
  status: number
  completed: boolean
}

export interface LoginResponse {
  userId: string
  status: number
  completed: boolean
}

export interface ListDecksResponse {
  decks: any
  status: number
  completed: boolean
}

export interface SaveDeckResponse {
  status: number
  completed: boolean
}

export interface GetDeckResponse {
  deck: string
  status: number
  completed: boolean
}

export interface StartupServerResponse {
  status: number
  completed: boolean
}

export interface StartGameSessionResponse {
  status: number
  completed: boolean
}

export interface GetHallResponse {
  waitingTables: string[]
  status: number
  completed: boolean
}

export interface LeaveTableResponse {
  status: number
  completed: boolean
}

export interface JoinTableResponse {
  status: number
  completed: boolean
}

export interface PlayTheGameResponse {
  status: number
  completed: boolean
}

export interface GameActionResponse {
  body: any
  status: number
  completed: boolean
}

export interface ExtendGameTimerResponse {
  status: number
  completed: boolean
}

export interface DisableActionTimerResponse {
  status: number
  completed: boolean
}

export default class ApiClient {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async _get(path: string, data?: any, user?: User): Promise<AxiosResponse> {
    let headers = {};
    let query = '';

    if (user) {
      headers['Cookie'] = `loggedUser=${user.id}`
    }

    if (data) {
      const params = new URLSearchParams(data).toString();
      query = `?${params}`;
    }

    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}${path}${query}`,
        { headers: headers }
      );
      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async _post(path: string, data: any, user?: User): Promise<AxiosResponse> {
    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/x-www-form-urlencoded',
    };

    if (user) {
      headers['Cookie'] = `loggedUser=${user.id}`;
    }

    try {
      const response: AxiosResponse = await axios.post(
        `${baseUrl}${path}`,
        data,
        { headers: headers }
      );
      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async getHeartbeat(): Promise<HeartbeatResponse> {
    const response: AxiosResponse = await this._get('/gemp-swccg');

    return ({
      status: response.status,
      completed: response.status == 200
    });
  }

  async postLogin(username: string, password: string): Promise<LoginResponse> {
    const response: AxiosResponse = await this._post('/gemp-swccg-server/login', {
      login: username,
      password: password,
      participantId: null
    });

    const cookies = response.headers ? response.headers['set-cookie'] : [];

    return ({
      userId: cookies.length > 0 ? cookies[0].split('=')[1] : null,
      status: response.status,
      completed: response.status == 200
    });
  }

  async listDecks(user: User): Promise<ListDecksResponse> {
    const response: AxiosResponse = await this._get('/gemp-swccg-server/deck/list', {}, user);
    const xml = response.data;
    let json = await xml2js.parseStringPromise(xml).then(function(result) {
      return result.decks;
    })
      .catch(function(error) {
        console.error(error);
        return error;
      });

    return ({
      decks: { dark: json.darkDeck, light: json.lightDeck },
      status: response.status,
      completed: response.status == 200
    });
  }

  // TODO: API should be cards: string[], sideboard: string[] - and then create deckstring
  //       or maybe just a file? - maybe thats just a helper that loads a file to a deckstring
  async saveDeck(name: string, contents: string, user: User): Promise<SaveDeckResponse> {
    const data = {
      deckName: name,
      deckContents: contents
    };
    const response: AxiosResponse = await this._post('/gemp-swccg-server/deck', data, user);

    return ({
      status: response.status,
      completed: response.status == 200
    });
  }

  async getDeck(name: string, user: User): Promise<GetDeckResponse> {
    const response: AxiosResponse = await this._get('/gemp-swccg-server/deck', { deckName: name }, user);
    const xml = response.data;
    let json = await xml2js.parseStringPromise(xml).then(function(result) {
      return result;
    })
      .catch(function(error) {
        console.error(error);
        return error;
      });

    // TODO: use the XML
    const cards = json['deck']['card'].map((e) => e['$']['blueprintId']);

    return ({
      deck: cards,
      status: response.status,
      completed: response.status == 200
    });
  }

  async startupServer(adminUser): Promise<StartupServerResponse> {
    const response: AxiosResponse = await this._get('/gemp-swccg-server/admin/startup', {}, adminUser);

    return ({
      status: response.status,
      completed: response.status == 200
    });
  }

  async startGameSession(tableName: string, deckName: string, user: User): Promise<StartGameSessionResponse> {
    const data = {
      tableDesc: tableName,
      deckName: deckName,
      isPrivate: false,
      format: 'open',
      sampleDeck: false,
    };
    const response: AxiosResponse = await this._post('/gemp-swccg-server/hall', data, user);

    return ({
      status: response.status,
      completed: response.status == 200
    });
  }

  async getHall(user: User): Promise<GetHallResponse> {
    const response: AxiosResponse = await this._get('/gemp-swccg-server/hall', {}, user);
    const xml = response.data;
    let json = await xml2js.parseStringPromise(xml).then(function(result) {
      return result;
    })
      .catch(function(error) {
        console.error(error);
        return error;
      });

    const waitingTables = json['hall']['table'].filter(e => e['$']['status'] == 'WAITING').map(e => e['$']['id']);

    return ({
      waitingTables: waitingTables,
      status: response.status,
      completed: response.status == 200
    });
  }

  async leaveTable(tableId: string, user: User): Promise<LeaveTableResponse> {
    const response: AxiosResponse = await this._post(`/gemp-swccg-server/hall/${tableId}/leave`, {}, user);

    return ({
      status: response.status,
      completed: response.status == 200
    });
  }

  async joinTable(tableId: string, deckName: string, user: User): Promise<JoinTableResponse> {
    const data = {
      deckName: deckName,
      sampleDeck: false,
    };
    const response: AxiosResponse = await this._post(`/gemp-swccg-server/hall/${tableId}`, data, user);

    return ({
      status: response.status,
      completed: response.status == 200
    });
  }

  async extendGameTimer(tableId: string, n: number, user: User): Promise<ExtendGameTimerResponse> {
    const data = {
      minutesToExtend: n,
    };

    const response: AxiosResponse = await this._post(`/gemp-swccg-server/game/${tableId}/extendGameTimer`, data, user);
    // console.log(JSON.stringify(response));

    return ({
      status: response.status,
      completed: response.status == 200
    });
  }

  async extendBothGameTimers(tableId: string, n: number, user1: User, user2: User): Promise<ExtendGameTimerResponse> {
    const response1 = await this.extendGameTimer(tableId, n, user1);
    const response2 = await this.extendGameTimer(tableId, n, user2);
    return response2;
  }

  async disableActionTimer(tableId: string, user: User): Promise<DisableActionTimerResponse> {
    const response: AxiosResponse = await this._post(`/gemp-swccg-server/game/${tableId}/disableActionTimer`, null, user);

    return ({
      status: response.status,
      completed: response.status == 200
    });
  }

  async disableBothActionTimers(tableId: string, user1: User, user2: User): Promise<DisableActionTimerResponse> {
    const response1 = await this.disableActionTimer(tableId, user1);
    const response2 = await this.disableActionTimer(tableId, user2);
    return response2;
  }

  async gamePing(tableId: string, user: User): Promise<GameActionResponse> {
    const response: AxiosResponse = await this._get(`/gemp-swccg-server/game/${tableId}`, null, user);

    return ({
      body: response.data,
      status: response.status,
      completed: response.status == 200
    });
  }

  async gameAction(tableId: string, decisionId: string, decisionValue: string, cn: number, user: User): Promise<GameActionResponse> {
    const data = {
      channelNumber: cn,
      decisionId: decisionId,
      decisionValue: decisionValue,
    };

    const response: AxiosResponse = await this._post(`/gemp-swccg-server/game/${tableId}`, data, user);

    return ({
      body: response.data,
      status: response.status,
      completed: response.status == 200
    });
  }

  // Possible TODOs:
  // gameDecisionMade - what is this?
  // updateHall
  // updateGameState
  // getGameCardModifiers - what is this?
  // sendChatMessage
  // updateChat - what is this?

}
