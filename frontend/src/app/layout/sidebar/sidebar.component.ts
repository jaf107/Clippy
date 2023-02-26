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

  public extractiveOn: boolean = false;
  public abstractiveOn: boolean = false;

  ngOnInit(): void {

    this.pdfShareService.getSummarizerStatus().subscribe((value)=>{
      if(value == false){
        this.extractiveOn = false;
        this.abstractiveOn = false;
      }
    })

  }

  toggleSidebar() {
    this.isActive = !this.isActive;
  }

  showOptions(){
    this.optionsActive = !this.optionsActive;
  }

  toggleSummarizer(type: string){

    if(type == 'Extractive'){
      if(this.extractiveOn == false){
        this.extractiveOn = true;
        this.abstractiveOn = false;
      }
      else{
        this.extractiveOn = false;
        this.abstractiveOn = false;
      }

      this.pdfShareService.setSummarizerOn(type, this.extractiveOn);
    }
    else{
      if(this.abstractiveOn == false){
        this.extractiveOn = false;
        this.abstractiveOn = true;
      }
      else{
        this.extractiveOn = false;
        this.abstractiveOn = false;
      }

      this.pdfShareService.setSummarizerOn(type, this.abstractiveOn);
      
    }

    
  }
}
