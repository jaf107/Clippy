import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PdfShareService {

  constructor() { }

  public file: any;

  sendFile(uploadedFile: any){
    this.file = uploadedFile;
  }

  getFile():any{
    console.log(this.file);
    return this.file;
  }
}
