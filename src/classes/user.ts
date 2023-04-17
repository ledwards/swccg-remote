export default class User {
  id: string
  currentDeck: string
  currentGame: string

  constructor(id?: string) {
    this.id = id;
  }
}
