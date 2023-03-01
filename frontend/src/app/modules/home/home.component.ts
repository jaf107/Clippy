import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PdfShareService } from '../shared/pdf-share.service';


import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

interface history{
  openedAt: string,
  paper_id: string,
  title: string,
  _id: string
}


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

  historyList: history[] = [];

  ngOnInit(){
    this.pdfShareService.getHistory().subscribe(
      (data) => {
        console.log(data);
        this.historyList = data.history;
        this.historyList = this.historyList.slice(0,2);
        console.log(this.historyList);
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
        console.log(this.url);
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
      this.pdfShareService.searchPaperByTitle(this.searchedTerm).subscribe(
        (data) => {
          console.log(data);
        }
      )
    }
    else if(this.searchBy == 'DOI'){
      this.pdfShareService.searchPaperbyId(this.searchedTerm).subscribe(
        (data) => {
          console.log(data);
          this.pdfShareService.sendFile(data.url);
          this.router.navigate(['pdfviewer']);
        }
      )
    }
    else{
      this.toastr.error('Select Search Type');
    }
  }

  sendFile(){
    const formData: FormData = new FormData();
    formData.append('paper', this.file);
    formData.append('title', this.pdfShareService.getTitle());
    //console.log('formdata: ',formData)
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
