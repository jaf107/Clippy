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

  constructor(
    public http: HttpClient,
    public tokenStorage: TokenStorageService
  ) { }

  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
    'x-auth-token': JSON.stringify(this.tokenStorage.getToken()),
  });

  sendFile(uploadedFile: any) {
    this.file = uploadedFile;
  }

  getFile(): any {
    console.log(this.file);
    return this.file;
  }

  sendFiletoServer(formData: FormData): Observable<any> {
    return this.http.post(API_URL + '/upload', formData, { headers : this.headers });
  }

  getHistory(): Observable<any> {
    let _id = this.tokenStorage.getUser().id;
    console.log(_id);
    return this.http.get(API_USER_URL + _id, { headers : this.headers });
  }

  searchPaperByTitle(): Observable<any> {
    return this.http.get(API_URL + '/searchByTitle', { headers : this.headers });
  }


}
