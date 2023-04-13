import axios, { AxiosResponse } from 'axios';

import * as dotenv from 'dotenv'
dotenv.config();
const baseUrl = process.env.GEMP_SERVER_URL;

export interface HeartbeatResponse {
  status: number,
  completed: boolean
}

export interface LoginResponse {
  userId: string,
  status: number,
  completed: boolean
}

export default class ApiClient {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async _get(path: string): Promise<AxiosResponse> {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}${path}`
      );
      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async _post(path: string, data: any): Promise<AxiosResponse> {
    console.log(`${baseUrl}${path}`);
    try {
      const response: AxiosResponse = await axios.post(
        `${baseUrl}${path}`,
        data,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/x-www-form-urlencoded',
          },
        },
      );
      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async getHeartbeat(): Promise<HeartbeatResponse> {
    const response: AxiosResponse<HeartbeatResponse> = await this._get('/gemp-swccg');

    return ({
      status: response.status,
      completed: response.status == 200
    });
  }

  async postLogin(username: string, password: string): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this._post('/gemp-swccg-server/login', {
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
}
