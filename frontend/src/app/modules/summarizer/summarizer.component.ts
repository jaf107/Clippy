import { Component, OnInit } from '@angular/core';
import * as extractiveSummary from '../../../assets/preprocessed.json';
import { PdfShareService } from '../shared/pdf-share.service';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';
import { FeaturesService } from '../shared/features.service';

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

  public currentChunkSummary: string =
    'Click any of the title to view its content summary';
  public currentChunkTitle: string = 'Select a Title';

  public summarizerType = '';

  ngOnInit() {
    // this.summary = extractiveSummary;
    // console.log(extractiveSummary);

    this.featureService.getSummarizerType().subscribe((value) => {
      this.summarizerType = value;
      console.log(this.summarizerType);

      if (this.summarizerType == 'Extractive') {
        this.summary = this.featureService.getSummary();
        // this.featureService
        //   .getExtractiveSummary(this.pdfShareService.paper_id)
        //   .subscribe((data) => {
        //     data = JSON.parse(data);
        //     this.summary = data.paragraphs;
        //     console.log(this.summary);
        //   });
      } else {
        this.featureService
          .getAbstractiveSummary(this.pdfShareService.paper_id)
          .subscribe((data) => {
            console.log(data);
            this.summary = data;
          });
      }
    });
  }

  showChunkSummary(chunk: any) {
    this.currentChunkSummary = chunk.summaryText;
    this.currentChunkTitle = chunk.title;
  }

  closeSummary() {
    this.featureService.setSummarizerOff(false);
  }

  onClipboardCopy(successful: boolean) {
    this.toastr.show('Text copied to Clipboard');
    console.log(successful);
  }
}
