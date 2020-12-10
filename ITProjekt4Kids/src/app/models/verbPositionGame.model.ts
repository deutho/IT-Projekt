export class VerbPositionGame{
    
    public constructor(public uid: string,
        public words: Map<string, string>[],
        public question: string[],
        public photoID: string,
        public folderUID: string) {
    }
}