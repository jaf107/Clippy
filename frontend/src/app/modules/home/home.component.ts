import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PdfShareService } from '../shared/pdf-share.service';


import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { UserService } from 'src/app/user.service';
import { TokenStorageService } from 'src/app/token-storage.service';

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
    private router: Router,
    private userService: UserService,
    private tokenStorage : TokenStorageService
  ) {}

  private file: File | null;
  private url: any;

  faMagnifyingGlass = faMagnifyingGlass;

  searchedTerm = '';
  searchBy = 'Search by';

  visitedFiles = [];

  historyList: history[] = [];
  isGuest = false;

  userName = '';

  ngOnInit(){

    this.userName = this.tokenStorage.getUser().username;
    if(this.userName == null){
      this.isGuest = true;
    }
    else{
      this.pdfShareService.getHistory().subscribe(
      (data) => {
        this.historyList = data.history;
        this.historyList = this.historyList.slice(0,2);
      }
    )
    }
  }

  openFileDialog() {
    document.querySelector('input').click();
  }

  handle(e) {
    this.file = e.target.files[0];
    if (this.file.type != 'application/pdf') {
      this.errorsmsg();
    } else {

      this.visitedFiles.push({ name: this.file.name, lastVisited: new Date() });

      const reader = new FileReader();
      reader.onload = () => {
        this.url = reader.result;
        this.pdfShareService.sendFile(this.url);
        this.pdfShareService.sendRawFile(this.file);

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
    if(this.searchBy == 'Title'){
      this.pdfShareService.searchPaperByTitle(this.searchedTerm).subscribe(
        (data) => {
          console.log(data);
        },
        (err) => {
          this.toastr.error(err.error);
        }
      )
    }
    else if(this.searchBy == 'DOI'){
      this.pdfShareService.searchPaperbyId(this.searchedTerm).subscribe(
        (data) => {
          console.log(data);
          this.pdfShareService.sendFile(data.url);
          this.router.navigate(['pdfviewer']);
        },
        (err) => {
          this.toastr.error(err.error);
        }
      )
    }
    else{
      this.toastr.error('Select Search Type');
    }
  }

  searchPaperToggle(searchType : string){
    this.searchBy = searchType;
  }

}
