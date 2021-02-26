import { Component, Input } from '@angular/core';

@Component({
  selector: 'uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.css']
})


export class UploaderComponent {
  @Input() public currentGameUID: string;
  @Input() public path: string

  isHovering: boolean;
  tooManyFiles: boolean = false;
  files: File[] = [];
  toggleHover(event: boolean) {
    this.isHovering = event;
  }


  onDrop(files: FileList) {
    if (files.length > 1) {
      this.tooManyFiles = true;
      setTimeout(() => this.tooManyFiles = false, 3500);
    }
    else{
      for (let i = 0; i < files.length; i++) {
        this.files.push(files.item(i));        
      }
    }    
  }
}