import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { VotingRoomComponent } from './components/voting-room/voting-room.component';

export const routes: Routes = [
  {
    title: 'Sprint planner yo',
    path: '',
    component: LandingPageComponent,
  },
  {
    title: 'Voting Room',
    path: 'room',
    component: VotingRoomComponent
  }
];
