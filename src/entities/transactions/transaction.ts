import { TransactionCategory } from "./transactionCategory";

export class Transaction {
    public id: number = -1;
    public category: TransactionCategory;
    private _value: number = 0;
    public date: Date;
    public recurrence : boolean;

    constructor(
        category: TransactionCategory,
        value: number,
        date: Date,
        recurrence : boolean
    ) {
        this.category = category;
        this.value = value;
        this.date = date;
        this.recurrence = recurrence;
    }

    get value() : number{
        return this._value;
    }

    set value( value : number){
        this._value = Math.round(value*100)/100;
    }
}