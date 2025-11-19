import { TransactionCategory } from "./transactionCategory";

export class Transaction {
    public readonly id: string;
    public category: TransactionCategory;
    public value: number;
    public date: Date;

    constructor(
        id: string,
        category: TransactionCategory,
        value: number,
        date: Date
    ) {
        this.id = id;
        this.category = category;
        this.value = value;
        this.date = date;
    }
}