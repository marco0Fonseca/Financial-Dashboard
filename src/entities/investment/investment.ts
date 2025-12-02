import { Transaction } from "../transactions/transaction";
import { TransactionCategory } from "../transactions/transactionCategory";
import { differenceInMonths } from "date-fns";
import { TransactionTypeClass } from "../transactionTypeClass";
import { categoryRepo } from "../../server/server";

//For creation of a object of this class is necessary use :
// const investment = await Investment.create(
//     description,
//     value,
//     date,
//     recurrence,
//     userId,
//     investmentLabel,
//     rate,
//     entrance,
//     recurrenceAdd,
//     monthsDuration
// );

export class Investment extends Transaction {
    public rate: number;      // taxa (%) que o investimento rende
    public readonly entrance : number;
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
        entrance: number,
        recurrenceAdd: number,
        monthsDuration: number
    ) {
        super(description, category, value, date, recurrence, userId);

        this.rate = rate;
        this.monthsDuration = monthsDuration;
        this.entrance = entrance;
        this.recurrenceAdd = recurrenceAdd;
    }

    static async create(
        description: string | undefined,
        value: number,
        date: Date,
        recurrence: boolean,
        userId: string,
        rate: number,
        entrance: number,
        recurrenceAdd: number,
        monthsDuration: number
    ): Promise<Investment> {

        let category = await categoryRepo.findCategoryByLabel(userId,"Investment");
        
        if (!category) {
            category = new TransactionCategory(
                "Investment",
                TransactionTypeClass.INVESTMENT,
                userId
            );
        }

        return new Investment(
            description,
            category,
            value,
            date,
            recurrence,
            userId,
            rate,
            entrance,
            recurrenceAdd,
            monthsDuration
        );
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

        const futureInitial = this.entrance * Math.pow(1 + this.rate, n);

        const futureRecurring =
            this.recurrenceAdd > 0
                ? this.recurrenceAdd * ((Math.pow(1 + this.rate, n) - 1) / this.rate)
                : 0;
                        
        return futureInitial + futureRecurring;
    }
}