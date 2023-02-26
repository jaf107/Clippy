import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/paper/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};


@Injectable({
  providedIn: 'root'
})
export class FeaturesService {

  constructor(private http : HttpClient) { }

  getCitationGraph(_id : string): Observable<any> {
    return this.http.get(API_URL + _id + '/citations', { responseType: 'text' });
  }

}
