export class VerbPositionGame{
    
    public constructor(
        public uid: string,
        public words: string[],
        public audio: string[],
        public question: string[],
        public photoID: string,
        public folderUID: string,
        public easyMode: boolean,
        public punctuationType: string) {
    }
}