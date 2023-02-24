import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PdfShareService } from '../shared/pdf-share.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private toastr: ToastrService, public pdfShareService: PdfShareService, private route: Router) { }  

  private file: File | null;
  private url: any;

  openFileDialog(){
    document.querySelector('input').click();
  }

  handle(e){
    console.log('change input file');
    this.file = e.target.files[0];
    console.log('size', this.file.size);

    if(this.file.type != 'application/pdf'){
      console.log('Not supported file type!');
      this.errorsmsg();
     }

    const reader = new FileReader();
    reader.onload = () => {
      // this.url = new Uint8Array(reader.result as ArrayBuffer);
      // this.url = new Uint8Array(e.target.files[0].arrayBuffer());
      this.url = reader.result;
      this.pdfShareService.sendFile(this.url);

      this.route.navigate(['pdfviewer']);
    };
    reader.readAsArrayBuffer(this.file);

  }

  errorsmsg(){  
    this.toastr.error("The uploaded file is not a pdf",'Unsupported File Type');
  }
}
