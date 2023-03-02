import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { TokenStorageService } from 'src/app/token-storage.service';
import { PdfShareService } from './pdf-share.service';

const API_URL = 'http://localhost:8080/api/paper/';

@Injectable({
  providedIn: 'root',
})
export class FeaturesService {
  public summarizerType: string = '';
  public summary: any;
  public fileurl: string = '';

  constructor(
    private http: HttpClient,
    public tokenStorage: TokenStorageService,
    public pdfShareService: PdfShareService
  ) {
    this.summarizerOnCheck.next(false);
  }

  headers = new HttpHeaders({
    'Content-Type': 'application/json, text',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, x-access-token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
    'x-access-token': JSON.stringify(this.tokenStorage.getToken()),
  });

  knowledgeGraphOnCheck: Subject<boolean> = new Subject<boolean>();

  summarizerOnCheck: Subject<boolean> = new Subject<boolean>();
  summarizerTypeCheck: Subject<string> = new Subject<string>();

  setSummarizerOn(type: string, onOff: boolean) {
    this.summarizerOnCheck.next(onOff);
    this.summarizerTypeCheck.next(type);
  }

  setSummarizerOff(onOff: boolean) {
    this.summarizerOnCheck.next(onOff);
  }

  getSummarizerStatus(): Observable<boolean> {
    return this.summarizerOnCheck.asObservable();
  }

  getSummarizerType(): Observable<string> {
    return this.summarizerTypeCheck.asObservable();
  }

  setKnowledgeGraphOn(onOff: boolean) {
    this.knowledgeGraphOnCheck.next(onOff);
    console.log('knowledge graph turned on');
  }

  storeSummary(summary: any) {
    this.summary = summary;
  }
  getSummary() {
    return this.summary;
  }

  getKnowledgeGraphStatus(): Observable<boolean> {
    return this.knowledgeGraphOnCheck.asObservable();
  }

  getCitationGraph(_id: string): Observable<any> {
    return this.http.get(API_URL + _id + '/citations', {
      headers: this.headers,
      responseType: 'text',
    });
    // '?fields=citations'
  }

  getExtractiveSummary(_id: string): Observable<any> {
    return this.http.post(API_URL + _id + '/extractiveSummary', {
      headers: this.headers,
    });
  }

  getAbstractiveSummary(_id: string): Observable<any> {
    return this.http.post(API_URL + _id + '/abstractiveSummary', {
      headers: this.headers,
    });
  }
}
