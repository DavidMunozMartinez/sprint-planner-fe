import { Inject, Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  randString() {
    return (Math.random() + 1).toString(36).substring(2)
  }
}
