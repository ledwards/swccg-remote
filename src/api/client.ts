import axios, { AxiosResponse } from 'axios';

import * as dotenv from 'dotenv'
dotenv.config();
const baseUrl = process.env.GEMP_SERVER_URL;

export interface HeartbeatResponse {
  status: number
  completed: boolean;
}

export default class ApiClient {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async _get(path: string): Promise<AxiosResponse> {
    try {
      const response: AxiosResponse = await axios.get(`${baseUrl}${path}`);
      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async getHeartbeat(): Promise<HeartbeatResponse> {
    try {
      const response: AxiosResponse<HeartbeatResponse> = await this._get('/');
      return ({
        status: response.status,
        completed: true
      });
    } catch (error) {
      console.error(error);
      return ({
        status: error.status,
        completed: false
      });
    }
  }
}
