export enum TransactionTypeClass {
  COST = "COST",
  GAIN = "GAIN",
  INVESTMENT = "INVESTMENT"
}

export class TransactionCategory {
    public id: number = -1;
    public label: string;
    public type: TransactionTypeClass;
    public readonly userId: string;

    constructor(label: string, type: TransactionTypeClass, userId : string) {
        this.label = label;
        this.type = type;
        this.userId = userId;
    }
}