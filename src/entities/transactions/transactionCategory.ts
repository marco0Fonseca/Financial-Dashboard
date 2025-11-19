enum TransactionType {
  COST = "COST",
  GAIN = "GAIN",
  INVESTMENT = "INVESTMENT"
}

export class TransactionCategory {
    public readonly id: string;
    public label: string;
    public type: TransactionType;

    constructor(id: string, label: string, type: TransactionType) {
        this.id = id;
        this.label = label;
        this.type = type;
    }
}