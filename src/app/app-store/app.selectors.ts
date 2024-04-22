import { createSelector } from "@ngrx/store";
import { AppState } from "./app.store";

export const selectApp = (state: { appReducer: AppState}) => state['appReducer']

export const selectRoom = createSelector(selectApp, state => state.ROOM);

export const selectName = createSelector(selectApp, state => state.NAME);

export const selectId = createSelector(selectApp, state => state.ID);

export const selectCachedRoomId = createSelector(selectApp, state => state.CACHED_ROOM_ID)