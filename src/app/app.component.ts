import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UtilsService } from './services/utils.service';
import { Store } from '@ngrx/store';
import { AppState } from './app-store/app.store';
import { setCachedRoomId, setId, setName } from './app-store/app.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sprint-planner';

  utils = inject(UtilsService)
  store = inject(Store<AppState>)

  constructor() {
    const id = localStorage.getItem("id") || this.utils.randString();
    this.store.dispatch(setId({ id }));

    const name = localStorage.getItem("name");
    if (name) {
      this.store.dispatch(setName({ name }));
    }

    const cachedRoomId = localStorage.getItem("cachedRoomId");
    if (cachedRoomId) {
      this.store.dispatch(setCachedRoomId({ cachedRoomId }))
    }
  }
}
