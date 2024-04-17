import { Component, WritableSignal, computed, inject, signal } from "@angular/core";
import { RoomsService } from "../../services/rooms.service";
import { Voter } from "../../classes/voter";
import { WSHandler } from "../../services/ws-handler";
import { firstValueFrom } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { StatisticsComponent } from "../statistics-component/statistics.component";

@Component({
  selector: 'voting-room',
  templateUrl: './voting-room.component.html',
  styleUrls: ['./voting-room.component.scss'],
  standalone: true,
  imports: [StatisticsComponent]
})
export class VotingRoomComponent {

  name: string;
  voters: WritableSignal<Voter[]> = signal([]);
  roomId: string = ''
  me: Voter | null = null;

  revealed = signal(false);
  options = [0.5, 1, 2, 3, 5, 8, 13, 21]
  statisticsData = computed(() => this.voters().map((voter) => {
    return {
      name: voter.name || '',
      value: voter.vote
    }
  }));

  private roomsService = inject(RoomsService);
  private wsHandler = inject(WSHandler);
  private http = inject(HttpClient);

  constructor() {
    this.name = this.roomsService.name;

    if (this.roomsService.room) {
      this.voters.set(this.roomsService.room.voters);
      this.me = this.voters().find((voter) => voter.id === this.roomsService.id) || null
    } 

    if (!this.roomsService.room && this.roomsService.roomId) {
      this.roomsService.getRoomData(this.roomsService.roomId).then(() => {
        this.revealed.set(Boolean(this.roomsService.room?.revealed));
        this.voters.set(this.roomsService.room?.voters || []);
        this.me = this.voters().find((voter) => voter.id === this.roomsService.id) || null
      });
    }
    this.roomId = this.roomsService.roomId; 

    this.wsHandler.on('voterJoined', (data) => {
      const incommingVoter = data.voter;
      const voters = this.voters();
      const exists = voters.some((voter) => voter.id === incommingVoter.id)
      if (!exists) {
        voters.push(new Voter(incommingVoter));
        this.voters.set(voters)
      }
    });

    this.wsHandler.on('voterUpdated', (data) => {
      const voters = this.voters();
      const updatedVoter = voters.find((voter) => voter.id === data.voterId);
      if (updatedVoter) {
        updatedVoter[data.property] = data.value as never
        this.voters.set(voters)
      }
    });

    this.wsHandler.on('votesRevealed', (data) => {
      const voters = this.voters();
      const updatedVoters = voters.map((voter) => {
        voter.vote = data.votes[voter.id]
        return voter
      });
      this.voters.set(updatedVoters)
      this.revealed.set(true);
    });

    this.wsHandler.on('votesReset', () => {
      const voters = this.voters();
      const updatedVoters = voters.map((voter) => {
        voter.vote = -1;
        voter.hasVoted = false;
        return voter
      });
      this.voters.set(updatedVoters);
      this.revealed.set(false);
    });
  }

  updateMyVote(value: number) {
    if (this.revealed()) return;

    firstValueFrom(
      this.http.post('http://localhost:3000/update-vote', JSON.stringify({
        voterId: this.me?.id,
        roomId: this.roomId,
        value,
    }))).then((data: any) => {
      console.log(data);
      if (!this.me) return;

      if (this.me.vote === value) {
        this.me.vote = -1;
      } else {
        this.me.vote = value;
      }
    });
  }

  revealVotes() {
    firstValueFrom(
      this.http.post('http://localhost:3000/reveal-votes', JSON.stringify({
        roomId: this.roomId,
    }))).then((data: any) => {
    });
  }

  resetVotes() {
    firstValueFrom(
      this.http.post('http://localhost:3000/reset-votes', JSON.stringify({
        roomId: this.roomId,
    }))).then((data: any) => {
      console.log(data);
    });
  }
}