export default class Game {
  id: string
  channelNumber: number

  constructor(id?: string, channelNumber?: number) {
    this.id = id;
    this.channelNumber = channelNumber || 0;
  }
}
