

export class BugReport {
    public constructor(public time: firebase.firestore.Timestamp, public description: string, public user: string, public status: string) {}
}