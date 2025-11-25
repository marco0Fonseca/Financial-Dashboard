import { TransactionCategory } from "./transactionCategory";

export class Transaction {
    public readonly id: number;
    public category: TransactionCategory;
    private _value: number = 0;
    public date: Date;

    constructor(
        id: number,
        category: TransactionCategory,
        value: number,
        date: Date
    ) {
        this.id = id;
        this.category = category;
        this.value = value;
        this.date = date;
    }

    get value() : number{
        return this._value;
    }

    set value( value : number){
        this._value = Math.round(value*100)/100;
    }
}