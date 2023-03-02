import { Component, OnInit } from '@angular/core';
import * as extractiveSummary from '../../../assets/preprocessed.json';
import { PdfShareService } from '../shared/pdf-share.service';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';
import { FeaturesService } from '../shared/features.service';
import { Observable, Subject } from 'rxjs';

interface chunk {
  title: String;
  noOfSentences: Number;
  text: String;
  summaryText: String;
}

@Component({
  selector: 'app-summarizer',
  templateUrl: './summarizer.component.html',
  styleUrls: ['./summarizer.component.css'],
})
export class SummarizerComponent implements OnInit {
  constructor(
    private featureService: FeaturesService,
    private pdfShareService: PdfShareService,
    private toastr: ToastrService
  ) {}

  public summary: chunk[] = [];

  // public summary: Observable<chunk[]>;

  public rawSummary: any;

  public currentChunkSummary: string =
    'Click any of the title to view its content summary';
  public currentChunkTitle: string = 'Select a Title';

  public absSummarizerOn: boolean;
  public exSummarizerOn: boolean;

  ngOnInit() {
    
      this.featureService.getExSummarizerStatus().subscribe((value) => {
        this.exSummarizerOn = value;
        this.currentChunkSummary = 'Click any of the title to view its content summary';
        this.currentChunkTitle = 'Select a Title';
      if(this.exSummarizerOn){
        this.featureService.getExtractiveSummary(this.pdfShareService.paper_id).subscribe(
      (data) => {
          data = JSON.parse(data);
          this.summary = data.paragraphs;
          console.log(this.summary);

          if(this.summary.length == 0){
            this.currentChunkSummary = 'No summary available for this pdf';
          }
        });
      }
    })

    this.featureService.getAbsSummarizerStatus().subscribe((value) => {
      this.absSummarizerOn = value;
      this.currentChunkSummary = 'Click any of the title to view its content summary';
      this.currentChunkTitle = 'Select a Title';

    if(this.absSummarizerOn){
      this.featureService.getAbstractiveSummary(this.pdfShareService.paper_id).subscribe(
      (data) => {
          data = JSON.parse(data);
          this.summary = data;
          console.log(this.summary);

          if(this.summary.length = 0){
            this.currentChunkSummary = 'No summary available for this pdf';
          }
        });
    }
  })

  }
  

  showChunkSummary(chunk: any) {
    this.currentChunkSummary = chunk.summaryText;
    this.currentChunkTitle = chunk.title;
  }

  closeSummary() {
    this.featureService.setAbsSummarizerOn(false);
    this.featureService.setExSummarizerOn(false);
  }

  onClipboardCopy(successful: boolean) {
    this.toastr.show('Text copied to Clipboard');
    console.log(successful);
  }
}
