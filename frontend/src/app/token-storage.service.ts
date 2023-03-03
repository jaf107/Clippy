import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';
const PAPER = 'current-paper';
const PAPER_ID = 'current-paper-id';
const PAPER_DATA = 'current-paper-data';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  constructor() {}

  signOut(): void {
    window.sessionStorage.clear();
  }

  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public savePaper(paper: any): void {
    window.sessionStorage.removeItem(PAPER);
    window.sessionStorage.setItem(PAPER, paper);
  }

  public getPaper(): any | null {
    return window.sessionStorage.getItem(PAPER);
  }

  public savePaperData(paperData: any): void{
    window.sessionStorage.removeItem(PAPER_DATA);
    window.sessionStorage.setItem(PAPER_DATA, paperData);
  }

  public getPaperData(): string | null {
    return window.sessionStorage.getItem(PAPER_DATA);
  }

  public savePaperId(paperId: any): void {
    window.sessionStorage.removeItem(PAPER_ID);
    window.sessionStorage.setItem(PAPER_ID, paperId);
  }

  public getPaperId(): string | null {
    return window.sessionStorage.getItem(PAPER_ID);
  }

  public getUser(): any {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }

    return {};
  }
}
