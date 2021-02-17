export class Folder{
    public constructor(public uid: string, public name: string, public type: string, public editors?: string[], public gameType?: string, public mutable?: boolean) {}
}