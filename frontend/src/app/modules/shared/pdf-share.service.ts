import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PdfShareService {

  constructor() { }

  public file: any;

  sendFile(uploadedFile: File){
    this.file = uploadedFile;
    console.log(uploadedFile.size);
  }

  getFile():File{
    return this.file;
  }
}
