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

  openFileDialog(){
    document.querySelector('input').click();
  }

  handle(e){
    console.log('change input file');
    this.file = e.target.files[0];
    console.log('size', this.file.size);
  //  console.log('type', this.file.type);

   if(this.file.type != 'application/pdf'){
    console.log('Not supported file type!');
    this.errorsmsg();
   }

   this.pdfShareService.sendFile(this.file);
   this.route.navigate(['pdfviewer']);

  }

  errorsmsg(){  
    this.toastr.error("The uploaded file is not a pdf",'Unsupported File Type');
  }
}
