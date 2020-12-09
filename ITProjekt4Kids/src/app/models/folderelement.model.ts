import { Folder } from './folder.model';

export class Folderelement{
    public constructor(public folders: Folder[], public parent: string) {}
}