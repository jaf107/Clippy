import { Component, OnInit } from '@angular/core';
import * as extractiveSummary from '../../../assets/preprocessed.json';
import { PdfShareService } from '../shared/pdf-share.service';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';
import { FeaturesService } from '../shared/features.service';
import { Observable, Subject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

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
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  public summary: chunk[] = [];
  public highlighted: any = [];

  // public summary: Observable<chunk[]>;

  public rawSummary: any;

  public currentChunkSummary: string =
    'Click any of the title to view its content summary';
  public currentChunkTitle: string = 'Select a Title';

  public absSummarizerOn: boolean;
  public exSummarizerOn: boolean;

  ngOnInit() {

      this.exSummarizerOn = this.featureService.extractiveSummarizerOnCheck.value;
      this.currentChunkSummary =
        'Click any of the title to view its content summary';
      this.currentChunkTitle = 'Select a Title';
      if (this.exSummarizerOn) {
        console.log('Summarizer On ');
        this.spinner.show();
        this.featureService
          .getExtractiveSummary(this.pdfShareService.getPaperId())
          .subscribe((data) => {
            data = JSON.parse(data);
            this.rawSummary = data.paragraphs;
            this.highlighted = data.highlighted;
            this.featureService.setHighlightedText(this.highlighted);

            if (this.rawSummary.length == 0) {
              this.currentChunkSummary = 'No summary available for this pdf';
            }

            this.spinner.hide();

          });
      }

      this.absSummarizerOn = this.featureService.abstractiveSummarizerOnCheck.value;
      this.currentChunkSummary =
        'Click any of the title to view its content summary';
      this.currentChunkTitle = 'Select a Title';

      if (this.absSummarizerOn) {
        console.log('Summarizer On ');
        this.spinner.show();
        this.featureService
          .getAbstractiveSummary(this.pdfShareService.getPaperId())
          .subscribe((data) => {
            console.log(JSON.parse(data));
            data = JSON.parse(data);
            this.rawSummary = data;
            console.log(this.rawSummary);
            
            if ((this.summary.length = 0)) {
              this.currentChunkSummary = 'No summary available for this pdf';
            }

            this.spinner.hide();
          });
      }
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
