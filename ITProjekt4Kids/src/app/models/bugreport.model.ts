import { Timestamp } from 'rxjs/internal/operators/timestamp';

export class BugReport {
    public constructor(public time: Timestamp<any>, public description: string, public user: string) {}
}