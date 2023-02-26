import { Component } from '@angular/core';
import { PdfShareService } from 'src/app/modules/shared/pdf-share.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  public isActive: boolean = true;
  public optionsActive: boolean = false;

  constructor(public pdfShareService: PdfShareService) { }

  ngOnInit(): void {
  }

  toggleSidebar() {
    this.isActive = !this.isActive;
  }

  showOptions(){
    this.optionsActive = !this.optionsActive;
  }

  toggleSummarizer(type: string){
    this.pdfShareService.setSummarizerOn(type, true);
  }
}
