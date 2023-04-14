import axios, { AxiosResponse } from 'axios';
import xml2js from 'xml2js';

import * as dotenv from 'dotenv';
import User from '../user';
dotenv.config();
const baseUrl = process.env.GEMP_SERVER_URL;

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
  xml: any
  status: number
  completed: boolean
}

export default class ApiClient {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async _get(path: string, user?: User): Promise<AxiosResponse> {
    let headers = {};
    if (user) {
      headers['Cookie'] = `loggedUser=${user.id}`
    }
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}${path}`,
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
      headers['Cookie'] = `loggedUser=${user.id}`
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

    // { 'set-cookie': [ 'loggedUser=k8OhKeH6duV8cgb2y6gl' ] }
    const cookies = response.headers ? response.headers['set-cookie'] : [];

    return ({
      userId: cookies.length > 0 ? cookies[0].split('=')[1] : null,
      status: response.status,
      completed: response.status == 200
    });
  }

  async listDecks(user: User): Promise<ListDecksResponse> {
    const response: AxiosResponse = await this._get('/gemp-swccg-server/deck/list', user);
    const xml = response.data;
    let json = await xml2js.parseStringPromise(xml).then(function(result) {
      console.log(result.decks);
      return result.decks;
    })
      .catch(function(error) {
        console.error(error);
        return error;
      });

    return ({
      decks: { dark: json.darkDeck, light: json.lightDeck },
      xml: response.data,
      status: response.status,
      completed: response.status == 200
    });
  }
}
