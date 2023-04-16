export default class User {
  id: string
  currentDeck: string

  constructor(id?: string) {
    this.id = id;
  }
}
