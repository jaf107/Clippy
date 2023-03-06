import { Component } from '@angular/core';
import { FeaturesService } from 'src/app/modules/shared/features.service';
import { PdfShareService } from 'src/app/modules/shared/pdf-share.service';
import { TokenStorageService } from 'src/app/token-storage.service';

interface chunk {
  title: String;
  noOfSentences: Number;
  text: String;
  summaryText: String;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  public isActive: boolean = true;
  public optionsActive: boolean = false;
  public enableHighlightOption: boolean = false;
  public highlightOn: boolean = false;

  constructor(
    public featureService: FeaturesService,
    public pdfShareService: PdfShareService,
    public tokenStorage: TokenStorageService
  ) {}

  public extractiveOn: boolean = false;
  public abstractiveOn: boolean = false;
  public summary: chunk[] = [];

  public knowledgeGraphOn: boolean = false;
  public pdfOn: boolean = true;

  public pdfData: any;

  ngOnInit(): void {
    this.pdfData = JSON.parse(this.tokenStorage.getPaperData());
    //   console.log(this.pdfData);
   

    this.featureService.getAbsSummarizerStatus().subscribe((value) => {
      if (value == false) {
        this.abstractiveOn = false;
      }
    });

    this.featureService.getExSummarizerStatus().subscribe((value) => {
      if (value == false) {
        this.extractiveOn = false;
      }
    });

    this.featureService.getKnowledgeGraphStatus().subscribe((value) => {
      this.knowledgeGraphOn = value;
    });
  }

  toggleSidebar() {
    this.isActive = !this.isActive;
  }

  showOptions() {
    this.optionsActive = !this.optionsActive;
  }

  showHighlighter() {
    this.enableHighlightOption = !this.enableHighlightOption;
  }

  toggleHighlighter() {
    this.highlightOn = !this.highlightOn;

    let highlightedSpans = document.querySelectorAll('.highlighed-text');
    highlightedSpans.forEach((span: HTMLElement) => {
      if (this.highlightOn) {
        span.setAttribute(
          'style',
          'background-color: yellow !important; color: yellow !important;'
        );
      } else {
        span.setAttribute(
          'style',
          'background-color: transparent !important; color: transparent !important;'
        );
      }
    });
  }

  toggleSummarizer(type: string) {
    if (type == 'Extractive') {
      if (this.extractiveOn == false) {
        this.extractiveOn = true;
        this.abstractiveOn = false;
        this.featureService.setExSummarizerOn(this.extractiveOn);
        this.featureService.setAbsSummarizerOn(this.abstractiveOn);
        this.featureService.setKnowledgeGraphOn(false);
      } else {
        this.extractiveOn = false;
        this.abstractiveOn = false;
        this.highlightOn = false;
        this.featureService.setExSummarizerOn(this.extractiveOn);
        this.featureService.setAbsSummarizerOn(this.abstractiveOn);
      }

      // this.featureService.setSummarizerOn(type, this.extractiveOn);
    } else {
      if (this.abstractiveOn == false) {
        this.extractiveOn = false;
        this.abstractiveOn = true;
        this.featureService.setAbsSummarizerOn(this.abstractiveOn);
        this.featureService.setExSummarizerOn(this.extractiveOn);
        this.featureService.setKnowledgeGraphOn(false);
      } else {
        this.extractiveOn = false;
        this.abstractiveOn = false;
        this.featureService.setAbsSummarizerOn(this.abstractiveOn);
        this.featureService.setExSummarizerOn(this.extractiveOn);
      }
    }
  }

  showGraph() {
    if (!this.knowledgeGraphOn) {
      this.featureService.setKnowledgeGraphOn(true);
      this.pdfOn = false;
      this.extractiveOn = false;
      this.abstractiveOn = false;
      this.featureService.setAbsSummarizerOn(this.abstractiveOn);
      this.featureService.setExSummarizerOn(this.extractiveOn);
    } else {
      this.pdfOn = true;
      this.featureService.setKnowledgeGraphOn(false);
    }
  }

  showPdf() {
    this.pdfOn = true;
    this.featureService.setKnowledgeGraphOn(false);
  }
}
