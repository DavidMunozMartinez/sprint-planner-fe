import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { flatMap, map, mergeMap } from 'rxjs/operators';
import { setCachedRoomId, setId, setName } from './app.actions';
import { EMPTY, Observable } from 'rxjs';
import { Action } from '@ngrx/store';

export const setId$ = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(setId),
      map(action => {
        localStorage.setItem("id", action.id);
      })
    )
  },
  { dispatch: false, functional: true, }
)

export const setName$ = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(setName),
      map(action => {
        localStorage.setItem("name", action.name);
      })
    )
  },
  { dispatch: false, functional: true, }
)

export const setCachedRoomId$ = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(setCachedRoomId),
      map(action => {
        localStorage.setItem("cachedRoomId", action.cachedRoomId);
      })
    )
  },
  { dispatch: false, functional: true, }
)