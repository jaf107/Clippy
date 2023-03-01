import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

const API_URL = 'http://localhost:8080/api/paper/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};


@Injectable({
  providedIn: 'root'
})
export class FeaturesService {

  
  public summarizerType: string = '';

  constructor(private http : HttpClient) { 
    this.summarizerOnCheck.next(false);
  }

  getCitationGraph(_id : string): Observable<any> {
    return this.http.get(API_URL + _id + '/citations', { responseType: 'text' });
    // '?fields=citations'
  }

  
  knowledgeGraphOnCheck: Subject<boolean> = new Subject<boolean>();

  summarizerOnCheck: Subject<boolean> = new Subject<boolean>();
  summarizerTypeCheck: Subject<string> = new Subject<string>();

  setSummarizerOn(type: string, onOff : boolean) {
      this.summarizerOnCheck.next(onOff);
      this.summarizerTypeCheck.next(type);
  }

  setSummarizerOff(onOff : boolean){
    this.summarizerOnCheck.next(onOff);
  }

  getSummarizerStatus(): Observable<boolean> {
    return this.summarizerOnCheck.asObservable();
  }

  getSummarizerType(): Observable<string> {
    return this.summarizerTypeCheck.asObservable();
  }

  setKnowledgeGraphOn(onOff : boolean){
    this.knowledgeGraphOnCheck.next(onOff);
    console.log("knowledge graph turned on");
  }

  getKnowledgeGraphStatus(): Observable<boolean> {
    return this.knowledgeGraphOnCheck.asObservable();
  }

}
