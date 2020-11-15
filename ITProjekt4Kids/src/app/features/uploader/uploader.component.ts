import { Component } from '@angular/core';

@Component({
  selector: 'uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})
export class UploaderComponent {

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

  test(event) {
    console.log(event)
  }
}