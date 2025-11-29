export class User{

    public id : string = '';
    public name : string;
    public email : string;
    public password? : string; // Only used during creation

    constructor(name : string, email : string, password? : string){
        this.name = name;
        this.email = email;
        this.password = password; 
    }
}