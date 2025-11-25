enum TransactionType {
  COST = "COST",
  GAIN = "GAIN",
  INVESTMENT = "INVESTMENT"
}

export class TransactionCategory {
    public readonly id: number;
    public label: string;
    public type: TransactionType;
    public readonly userId: string;

    constructor(id: number, label: string, type: TransactionType, userId : string) {
        this.id = id;
        this.label = label;
        this.type = type;
        this.userId = userId;
    }
}