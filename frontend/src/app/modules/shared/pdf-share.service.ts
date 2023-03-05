import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { TokenStorageService } from 'src/app/token-storage.service';

// const API_URL = 'http://bs23.ddnsfree.com/api/paper/';
// const API_USER_URL = 'http://bs23.ddnsfree.com/api/user/';
const API_URL = 'http://localhost:8080/api/paper/';
const API_USER_URL = 'http://localhost:8080/api/user/';
@Injectable({
  providedIn: 'root',
})
export class PdfShareService {
  public file: any;
  public rawFile: any;
  public title: string;

  public paper_id: any;

  public searchedbyDOIorTitle: boolean = false;

  constructor(
    public http: HttpClient,
    public tokenStorage: TokenStorageService
  ) {}

  headers = new HttpHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, x-access-token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
    'x-access-token': this.tokenStorage.getToken(),
  });

  setSearched(setSearched: boolean) {
    this.searchedbyDOIorTitle = setSearched;
  }

  getSearched(): boolean {
    return this.searchedbyDOIorTitle;
  }

  sendFile(uploadedOrSearchedFile: any) {
    this.file = uploadedOrSearchedFile;
  }

  sendRawFile(uploadedFile: any) {
    this.rawFile = uploadedFile;
  }

  getFile(): any {
    console.log(this.file);
    return this.file;
  }

  getRawFile(): any {
    return this.rawFile;
  }

  setPaperId(paperId: any) {
    this.paper_id = paperId;
    this.tokenStorage.savePaperId(paperId);
  }

  getPaperId(): string {
    return this.tokenStorage.getPaperId();
  }

  setTitle(title: string) {
    this.title = title;
  }

  getTitle() {
    return this.title;
  }

  sendFiletoServer(formData: FormData): Observable<any> {
    return this.http.post(API_URL + 'upload', formData, {
      headers: this.headers,
    });
  }

  getHistory(): Observable<any> {
    console.log(this.tokenStorage.getToken());
    let _id = this.tokenStorage.getUser().id;
    console.log(_id);
    return this.http.get(API_USER_URL + _id, { headers: this.headers });
  }

  searchPaperByTitle(searchedTerm: any): Observable<any> {
    return this.http.post(
      API_URL + 'searchByTitle',
      { title: searchedTerm },
      { headers: this.headers }
    );
  }

  searchPaperbyId(searchedTerm: any): Observable<any> {
    return this.http.post(
      API_URL + 'uploadById',
      { paper_id: searchedTerm },
      { headers: this.headers }
    );
  }

  getPaperFromSearch(url: any): Observable<any> {
    return this.http.post(
      API_URL + 'getpdf',
      { url: url },
      { headers: this.headers }
    );
  }
}
