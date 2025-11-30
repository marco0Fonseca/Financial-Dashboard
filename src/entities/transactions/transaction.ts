import { TransactionCategory } from "./transactionCategory";

export class Transaction {
    public id: number = -1;
    public category: TransactionCategory;
    private _value: number = 0;
    public date: Date;
    public recurrence : boolean;
    public userId : string

    constructor(
        category: TransactionCategory,
        value: number,
        date: Date,
        recurrence : boolean,
        userId : string
    ) {
        this.category = category;
        this.value = value;
        this.date = date;
        this.recurrence = recurrence;
        this.userId = userId;
    }

    get value() : number{
        return this._value;
    }

    set value( value : number){
        this._value = Math.round(value*100)/100;
    }
}