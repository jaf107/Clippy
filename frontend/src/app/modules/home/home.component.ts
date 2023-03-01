import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { pdfs } from 'src/app/interfaces/file';
import { TokenStorageService } from 'src/app/token-storage.service';
import { PdfShareService } from '../shared/pdf-share.service';
import PDFParser from "pdf2json";

import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit{
  constructor(
    private toastr: ToastrService,
    public pdfShareService: PdfShareService,
    private router: Router
  ) {}

  private file: File | null;
  private url: any;

  faMagnifyingGlass = faMagnifyingGlass;

  searchedTerm = '';
  searchBy = 'Search by';

  visitedFiles = [];

  ngOnInit(){
    this.pdfShareService.getHistory().subscribe(
      (data) => {
        console.log(data);
      }
    )
  }

  openFileDialog() {
    document.querySelector('input').click();
  }

  handle(e) {
    console.log('change input file');
    this.file = e.target.files[0];
    console.log('size', this.file.name);

    if (this.file.type != 'application/pdf') {
      console.log('Not supported file type!');
      this.errorsmsg();
    } else {

      //send form to server
      this.sendFile();

      this.visitedFiles.push({ name: this.file.name, lastVisited: new Date() });
      console.log(this.visitedFiles);

      const reader = new FileReader();
      reader.onload = () => {
        this.url = reader.result;
        this.pdfShareService.sendFile(this.url);

        this.router.navigate(['pdfviewer']);
      };
      reader.readAsArrayBuffer(this.file);
    }
  }

  errorsmsg() {
    this.toastr.error(
      'The uploaded file is not a pdf',
      'Unsupported File Type'
    );
  }

  searchPaper(){
    console.log('Searched paper is ' + this.searchedTerm);
    if(this.searchBy == 'Title'){
      
    }
  }

  sendFile(){
    const formData: FormData = new FormData();
    formData.append('file', this.file);

    this.pdfShareService.sendFiletoServer(formData).subscribe(
      (data) => {

      },
      (err) => {
        console.log("File sending failed");
      }
    )
  }

  searchPaperToggle(searchType : string){
    this.searchBy = searchType;
  }

}
