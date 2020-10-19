import {Injectable} from '@angular/core';

@Injectable()
export class ValidationMsgService {

    public getValidationMsg(validationId:string):string{
        return this.errorMessages[validationId];
    }

    private errorMessages = {
        "username-required-msg" : "Bitte geben Sie einen Benutzernamen ein",
        "password-required-msg": "Bitte geben Sie ein Passwort an",
        "password-or-username-wrong-msg": "Passwort oder Benutzername falsch",
    }
}


