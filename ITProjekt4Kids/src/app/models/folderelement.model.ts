import { Folder } from './folder.model';

export class Folderelement{
    public constructor(public folder: Folder, public parent: string) {}
}