export class Voter {

  id: string = '';
  name: string | null = null;
  isHost: boolean = false;
  hasVoted: boolean = false;
  vote: number = -1;

  constructor (voter: ServerVoterData) {
    this.id = voter.id;
    this.name = voter.name;
    this.isHost = voter.isHost;
    this.vote = voter.vote
    this.hasVoted = voter.hasVoted;
  }
}

export type ServerVoterData = {
  id: string;
  name: string;
  vote: number;
  isHost: boolean;
  hasVoted: boolean
}