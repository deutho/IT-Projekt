import { Injectable } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import { DomSanitizer } from '@angular/platform-browser';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import * as firebase from 'firebase';

@Injectable()
export class RecordRTCService {
  /**
   * NOTE: if your are upload the file on server then you change your according
   * UPLOAD ON SERVER @function stopRTC write your code
   */

  blobUrl: any;
  task: AngularFireUploadTask;
  snapshot: Observable<any>;
  percentage: Observable<number>;
  downloadURL$: Observable<string>;
  private mydownloadURLSubject: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  test: string;
  interval; 
  recordingTimer: string = ""; 
  recordWebRTC: any; 
  mediaRecordStream: any;
  options: any = {
    type: 'audio',
    mimeType: 'audio/webm'
  }
  app: any;
  currentGameUID: string;

  storage = firebase.storage();
  storageRef = this.storage.ref();


  constructor(
    private sanitizer: DomSanitizer,
    // private storage: AngularFireStorage
    
  ) {
    this.downloadURL$ = this.mydownloadURLSubject.asObservable();
   }

  /**
   * @function toggleRecord
   * check recording base on `recordingTimer`
   * getting permission on `mediaDevices` audio
   */
  toggleRecord(currentGameUID : string) {
    this.currentGameUID = currentGameUID;
    if (this.recordingTimer) {
      this.stopRTC();
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        this.startRTC(stream);
      }).catch(error => {
        alert(error)
      })
    }
  }

  /**
   * @param stream 
   * @name recordWebRTC set recording `stream` and `options`
   * @var blobUrl set null UI update
   * @see startCountdown()
   */
  startRTC(stream: any) {
    this.recordWebRTC = new RecordRTC.StereoAudioRecorder(stream, this.options);
    this.mediaRecordStream = stream;
    this.blobUrl = null;
    this.recordWebRTC.record();
    this.startCountdown();
  }

  /**
   * @function stopRTC
   * after `stop` recordWebRTC function getting blob
   * blob file making to blob url `blobUrl`
   * @name startCountdown stop counting with stream
   */
  stopRTC() : Promise<any>{
    return this.recordWebRTC.stop((blob) => {
      //NOTE: upload on server
    //   this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
    this.uploadToFirestore(blob);
    this.startCountdown(true);
    })
  }

  uploadToFirestore(blob): Promise<any>{

    // The storage path
    let name = Date.now() + '_' + blob.size
    const path = `/audio/${this.currentGameUID}_${name}`;

    // Reference to storage bucket
    var audioRef = this.storageRef.child(path);

    // The main task
    return audioRef.put(blob).then((snapshot) => {
      audioRef.getDownloadURL().then((data) => {
        // console.log(data)
        this.mydownloadURLSubject.next(data);
      })
      

    });
  }

  /**
   * @param clearTime default value `false` 
   * `false` miens recording start if getting `true` then we are stop counting `clearStream`
   * Maximum Recoding time `10`Minutes @see minutes == 10
   */
  startCountdown(clearTime = false) {
    if (clearTime) {
      this.clearStream(this.mediaRecordStream);
      this.recordWebRTC = null;
      this.recordingTimer = null;
      this.mediaRecordStream = null;
      clearInterval(this.interval);
      return
    } else {
      this.recordingTimer = `00:00`;
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      let timer: any = this.recordingTimer;
      timer = timer.split(':');
      let minutes = +timer[0];
      let seconds = +timer[1];

      // if (minutes == 10) {
      //   this.recordWebRTC.stopRecording();
      //   clearInterval(this.interval);
      //   return
      // }
      ++seconds;
      if (seconds >= 30) {
        // ++minutes;
        // seconds = 0;
        this.recordWebRTC.stopRecording();
        clearInterval(this.interval);
      }

      if (seconds < 10) {
        this.recordingTimer = `0${minutes}:0${seconds}`;
      } else {
        this.recordingTimer = `0${minutes}:${seconds}`;
      }
    }, 1000);
  }

  /**
   * @param stream clear stream Audio also video
   */
  clearStream(stream: any) {
    try {
      stream.getAudioTracks().forEach(track => track.stop());
      stream.getVideoTracks().forEach(track => track.stop());
    } catch (error) {
      //stream error
    }
  }

}
