import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfShareService {

  public file: any;

  public summarizerType: string = '';

  sendFile(uploadedFile: any){
    this.file = uploadedFile;
  }

  getFile():any{
    console.log(this.file);
    return this.file;
  }

    summarizerOnCheck: Subject<boolean> = new Subject<boolean>();

    constructor(){
      this.summarizerOnCheck.next(false);
    }

    setSummarizerOn(type: string, onOff : boolean) {
        this.summarizerOnCheck.next(onOff);
        this.summarizerType = type;
    }

    getSummarizerStatus(): Observable<boolean> {
      return this.summarizerOnCheck.asObservable();
    }

}
