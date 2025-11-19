export class User{

    public readonly id : string;
    public name : string;
    public email : string;
    private _password : string;

    constructor(
        id : string, name : string, email : string, password : string){
            
        this.id = id;
        this.name = name;
        this.email = email;
        this._password = password; 
    }
}