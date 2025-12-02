import { Transaction } from "../transactions/transaction";
import { TransactionCategory } from "../transactions/transactionCategory";
import { differenceInMonths } from "date-fns";

export class Investment extends Transaction {
    public rate: number;      // taxa (%) que o investimento rende
    public recurrenceAdd: number = 0;
    public monthsDuration: number;

    constructor(
        description: string | undefined,
        category: TransactionCategory,
        value: number,
        date: Date,
        recurrence: boolean,
        userId: string,
        rate: number,
        recurrenceAdd: number,
        monthsDuration: number
    ) {
        super(description, category, value, date, recurrence, userId);

        this.rate = rate;
        this.monthsDuration = monthsDuration;
        this.recurrenceAdd = recurrenceAdd;
    }

    calculateUntilNowGain() : number {
        const month = new Date();
        return this.calculateOnMonth(month);
    }

    calculateOnMonth(month : Date) : number{
        const months = differenceInMonths(
            this.date,
            month
        );

        return this.gain(months);
    }

    gain(monthsPassed?: number): number {
        const n = monthsPassed ?? differenceInMonths(new Date(), this.date);

        const futureInitial = this.value * Math.pow(1 + this.rate, n);

        const futureRecurring =
            this.recurrenceAdd > 0
                ? this.recurrenceAdd * ((Math.pow(1 + this.rate, n) - 1) / this.rate)
                : 0;
                        
        return futureInitial + futureRecurring;
    }
}