import { Component, OnInit } from '@angular/core';
import * as extractiveSummary from '../../../assets/preprocessed.json';
import { PdfShareService } from '../shared/pdf-share.service';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';
import { FeaturesService } from '../shared/features.service';


interface chunk {
  "title": String,
  "noOfSentences": Number,
  "text": String,
  "summaryText": String
}

@Component({
  selector: 'app-summarizer',
  templateUrl: './summarizer.component.html',
  styleUrls: ['./summarizer.component.css']
})
export class SummarizerComponent implements OnInit{

  constructor(
    private featureService: FeaturesService,
    private toastr: ToastrService, 
  ){}

  public summary : any = (extractiveSummary as any).default;

  public currentChunkSummary : string = "Click any of the title to view its content summary";
  public currentChunkTitle : string = "Select a Title";

  ngOnInit(){
    // this.summary = extractiveSummary;
    console.log(extractiveSummary);

    
    
  }


  showChunkSummary(chunk : any){
    this.currentChunkSummary = chunk.summaryText;
    this.currentChunkTitle = chunk.title;
  }

  closeSummary(){
    this.featureService.setSummarizerOff(false);
  }

  onClipboardCopy(successful: boolean){
    this.toastr.show('Text copied to Clipboard');
    console.log(successful);
  }


}
