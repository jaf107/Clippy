import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TokenStorageService } from 'src/app/token-storage.service';
import { PdfShareService } from './pdf-share.service';

const API_URL = 'http://bs23.ddnsfree.com/api/paper/';

@Injectable({
  providedIn: 'root',
})
export class FeaturesService {
  public summarizerType: string = '';
  public summary: any;
  public highlighted: BehaviorSubject<any[] | null> = new BehaviorSubject<
    any[]
  >(null);
  public fileurl: string = '';

  constructor(
    private http: HttpClient,
    public tokenStorage: TokenStorageService,
    public pdfShareService: PdfShareService
  ) {}

  headers = new HttpHeaders({
    'Content-Type': 'application/json, text',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, x-access-token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
    'x-access-token': JSON.stringify(this.tokenStorage.getToken()),
  });

  knowledgeGraphOnCheck: Subject<boolean> = new Subject<boolean>();

  extractiveSummarizerOnCheck: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );
  abstractiveSummarizerOnCheck: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );

  exSummaryOn: boolean;
  absSummaryOn: boolean;

  setAbsSummarizerOn(onOff: boolean) {
    this.abstractiveSummarizerOnCheck.next(onOff);
    this.absSummaryOn = onOff;
  }

  setExSummarizerOn(onOff: boolean) {
    this.extractiveSummarizerOnCheck.next(onOff);
    this.exSummaryOn = onOff;
  }

  getAbsSummarizerStatus(): Observable<boolean> {
    console.log("abs " + this.abstractiveSummarizerOnCheck.value);
    return this.abstractiveSummarizerOnCheck.asObservable();
  }

  getExSummarizerStatus(): Observable<boolean> {
    console.log("ex " + this.extractiveSummarizerOnCheck.value);
    return this.extractiveSummarizerOnCheck.asObservable();
  }

  setKnowledgeGraphOn(onOff: boolean) {
    this.knowledgeGraphOnCheck.next(onOff);
  }

  storeSummary(summary: any) {
    this.summary = summary;
  }
  getSummary() {
    return this.summary;
  }

  getHighlightedText() {
    console.log('inside highlighted');
    return this.highlighted;
  }
  setHighlightedText(highlighed: any) {
    this.highlighted.next(highlighed);
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
