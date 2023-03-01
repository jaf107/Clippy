import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfShareService {

  public file: any;
  sendFile(uploadedFile: any){
    this.file = uploadedFile;
  }

  getFile():any{
    console.log(this.file);
    return this.file;
  }

    constructor(){
    }


}
