import { Component, OnInit } from '@angular/core';
import * as extractiveSummary from '../../../assets/preprocessed.json';
import { PdfShareService } from '../shared/pdf-share.service';


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
    private pdfShareService : PdfShareService
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
    this.pdfShareService.setSummarizerOn("extractive", false);
  }


}
