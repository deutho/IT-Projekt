export class VocabularyGame{
    
    public constructor(public uid: string,
        public answer1: string[],
        public answer2: string[],
        public answer3: string[],
        public rightAnswer: string[],
        public question: string[],
        public photoID: string,
        public folderUID: string,
        public number: number,
        public coloring: boolean) {
        
    }
}