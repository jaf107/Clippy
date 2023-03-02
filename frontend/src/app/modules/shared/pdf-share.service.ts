import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { TokenStorageService } from 'src/app/token-storage.service';

const API_URL = 'http://localhost:8080/api/paper/';
const API_USER_URL = 'http://localhost:8080/api/user/';

@Injectable({
  providedIn: 'root'
})
export class PdfShareService {

  public file: any;
  public rawFile : any;
  public title: string;

  public paper_id = '649def34f8be52c8b66281af98ae884c09aef38b';

  constructor(
    public http: HttpClient,
    public tokenStorage: TokenStorageService
  ) { }

  headers = new HttpHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, x-access-token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
    'x-access-token': this.tokenStorage.getToken(),
  });

  sendFile(uploadedOrSearchedFile: any) {
    this.file = uploadedOrSearchedFile;
  }

  sendRawFile(uploadedFile: any){
    this.rawFile = uploadedFile;
  }

  getFile(): any {
    console.log(this.file);
    return this.file;
  }

  getRawFile(): any{
    return this.rawFile;
  }

  setTitle(title: string) {
    this.title = title;
  }

  getTitle() {
    return this.title;
  }

  sendFiletoServer(formData: FormData): Observable<any> {
    return this.http.post(API_URL + 'upload', formData, { headers : this.headers });
  }

  getHistory(): Observable<any> {
    console.log(this.tokenStorage.getToken());
    let _id = this.tokenStorage.getUser().id;
    console.log(_id);
    return this.http.get(API_USER_URL + _id, { headers : this.headers });
  }

  searchPaperByTitle(searchedTerm: any): Observable<any> {
    return this.http.get(API_URL + 'searchByTitle', { headers : this.headers });
  }

  searchPaperbyId(searchedTerm: any): Observable<any> {
    return this.http.post(API_URL + 'uploadById', { paper_id: searchedTerm }, { headers : this.headers });
  }


}
