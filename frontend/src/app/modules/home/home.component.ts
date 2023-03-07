import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PdfShareService } from '../shared/pdf-share.service';
import { NgxSpinnerService } from 'ngx-spinner';

import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { UserService } from 'src/app/user.service';
import { TokenStorageService } from 'src/app/token-storage.service';

interface history {
  openedAt: string;
  paper_id: string;
  title: string;
  _id: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  constructor(
    private toastr: ToastrService,
    public pdfShareService: PdfShareService,
    private router: Router,
    private userService: UserService,
    private tokenStorage: TokenStorageService,
    private spinner: NgxSpinnerService
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

  ngOnInit() {
    this.userName = this.tokenStorage.getUser().username;
    if (this.userName == null) {
      this.isGuest = true;
    } else {
      this.pdfShareService.getHistory().subscribe((data) => {
        this.historyList = data.history;
        this.historyList.reverse();
        this.historyList = this.historyList.slice(0, 2);
      });
    }
  }

  openFileDialog() {
    document.querySelector('input').click();
  }

  handle(e) {
    this.pdfShareService.setSearched(false);
    this.file = e.target.files[0];
    if (this.file.type != 'application/pdf') {
      this.errorsmsg();
    } else {
      this.visitedFiles.push({ name: this.file.name, lastVisited: new Date() });
      const reader = new FileReader();
      reader.onload = () => {
        this.url = reader.result;
        this.pdfShareService.sendFile(this.url);
        this.tokenStorage.savePaper(JSON.stringify(this.url));
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

  searchPaper() {
    this.pdfShareService.setSearched(true);
    if (this.searchBy == 'Title') {
      this.searchByTitle();
    } else if (this.searchBy == 'DOI') {
      this.searchById();
    } else {
      this.toastr.error('Select Search Type');
    }
  }

  searchByTitle() {
    this.spinner.show();
    this.pdfShareService.searchPaperByTitle(this.searchedTerm).subscribe(
      (data) => {
        this.pdfShareService
          .searchPaperbyId(data.data[0].paperId)
          .subscribe((data) => {
            this.tokenStorage.savePaperData(data);
            this.pdfShareService.setPaperId(data.paper_id);
            this.pdfShareService.getPaperFromSearch(data.url).subscribe(
              (data) => {
                this.pdfShareService.sendFile(data);
                this.tokenStorage.savePaper(JSON.stringify(data));
                this.router.navigate(['pdfviewer']);
                this.spinner.hide();
              },
              (err) => {
                this.toastr.error('Paper not found in Semantic Scholar');
                this.spinner.hide();
                console.log(err);
              }
            );
          });
      },
      (err) => {
        this.toastr.error(err.error);
        this.spinner.hide();
      }
    );
  }

  searchById() {
    // this.spinner.show();
    this.pdfShareService.searchPaperbyId(this.searchedTerm).subscribe(
      (data) => {
        this.tokenStorage.savePaperData(data);
        this.pdfShareService.setPaperId(data.paper_id);
        this.pdfShareService.getPaperFromSearch(data.url).subscribe(
          (data) => {
            this.pdfShareService.sendFile(data);
            this.tokenStorage.savePaper(JSON.stringify(data));
            this.router.navigate(['pdfviewer']);
            this.spinner.hide();
          },
          (err) => {
            console.log(err);
            this.toastr.error('Not found', 'Paper not found in Semantic Scholar');
            this.spinner.hide();
          }
        );
      },
      (err) => {
        this.spinner.hide();
        this.toastr.error(err.error);
      }
    );
    this.spinner.show();
  }

  searchPaperToggle(searchType: string) {
    this.searchBy = searchType;
  }

  viewHistoryPaper(historyFile: history) {
    this.searchedTerm = historyFile.paper_id;
    this.searchById();
  }
}
