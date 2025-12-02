import { PrismaClient, TransactionType } from '@prisma/client'
import { User } from '../entities/user';
import { TransactionCategory } from '../entities/transactions/transactionCategory';
import { TransactionTypeClass } from "../entities/transactionTypeClass";
import { Transaction } from '../entities/transactions/transaction';
import { hashPassword } from '../server/auth';
import { Investment } from '../entities/investment/investment';
import { categoryRepo } from '../server/server';

export const prisma = new PrismaClient();

export class UserRepository {
  async create(user : User) : Promise<User>{
    const hashedPassword  = user.password ? await hashPassword(user.password) : undefined;

    const userData = await prisma.user.create({
      data :{
        name : user.name,
        email : user.email,
        password : hashedPassword!,
      },
      include : {
        transactionCategories : true,
        transactions : true
      }
    });

    user.id = userData.id;
    user.password = undefined;

    return user;
  }

  async findUserById(id: string) {
    const userData = await prisma.user.findUnique({
      where: { id: id }
    })

    if(!userData) return null;

    const user = new User (userData.name, userData.email);
    user.id = userData.id;

    return user;
  }

  async findUserByEmail(email: string) {
    const userData = await prisma.user.findUnique({
      where: { email: email }
    })

    if(!userData) return null;

    const user = new User (userData.name, userData.email);
    user.id = userData.id;

    return user;
  }

  async findUserByEmailWithPassword(email: string) {
    const userData = await prisma.user.findUnique({
      where: { email: email }
    })

    if(!userData) return {user : null, password: null};

    const user = new User (userData.name, userData.email);
    user.id = userData.id;

    return { user, password: userData.password };
  }

  async updateName(id: string, newName: string) {
    return prisma.user.update({
      where: { id : id },
      data: { name: newName }
    });
  }

  async updateEmail(id: string, newEmail: string) {
    return prisma.user.update({
      where: { id : id },
      data: { email: newEmail }
    });
  }

  async updatePassword(id: string, newPassword: string) {
    const hashedPassword  = newPassword ? await hashPassword(newPassword) : undefined;

    return prisma.user.update({
      where: { id : id },
      data: { password: hashedPassword }
    });
  }

  async delete(id : string){
    return prisma.user.delete({
      where: { id }
    })
  }
}

export class TransactionCategoryRepository {
  async create(category : TransactionCategory){
    const categoryData = await prisma.transactionCategory.create({
      data: {
        label : category.label, 
        type : category.type,
        userId : category.userId
      }
    })

    category.id = categoryData.id;

    return category;
  }

  async findCategoryById(id: number) {
    const categoryData = await prisma.transactionCategory.findUnique({
      where: { id: id }
    })

    if(!categoryData) return null;

    const type = TransactionTypeClass[categoryData.type as keyof typeof TransactionTypeClass];

    const category = new TransactionCategory(
      categoryData.label,
      type,
      categoryData.userId
    );
    category.id = categoryData.id;

    return category;
  }
  
  async findUserCategories(userId : string) {
    const categoryData = await prisma.transactionCategory.findMany({
      where: {
        userId : userId,
       }
    })

    if(!categoryData || categoryData.length === 0) return null;

    const categories : TransactionCategory[] = [];

    categoryData.forEach(cd =>{
      const typeClass =  TransactionTypeClass[cd.type as keyof typeof TransactionTypeClass];
      const category = new TransactionCategory(cd.label,typeClass,cd.userId);
      categories.push(category);
    });

    return categories;
  }

  async findCategoryByLabel(userId : string, label : string){
    const categoryData = await prisma.transactionCategory.findFirst({
      where: { userId : userId,
               label: label }
    })

    if(!categoryData) return null;

    const type = TransactionTypeClass[categoryData.type as keyof typeof TransactionTypeClass];

    const category = new TransactionCategory(
      categoryData.label,
      type,
      categoryData.userId
    );
    category.id = categoryData.id;

    return category;
  }

  async delete(id : number){
    return prisma.transactionCategory.delete({
      where: { id : id }
    })
  }

  async updateLabel(id : number, newLabel : string){
    return prisma.transactionCategory.update({
      where: { id },
      data: { label: newLabel }
    })
  }

  async updateType(id : number, newType : TransactionType){
    return prisma.transactionCategory.update({
      where: { id },
      data: { type: newType }
    })
  }
}

export class TransactionRepository {
  async create(transaction : Transaction){
    const transactionData = await prisma.transaction.create({
      data: {
        description : transaction.description,
        value : transaction.value, 
        date : transaction.date,
        recurrence : transaction.recurrence,
        categoryId : transaction.category.id,
        userId : transaction.userId
      }
    })

    transaction.id = transactionData.id

    return transaction;
  }

  async findTransactionById(id: number) {
    const transactionData = await prisma.transaction.findUnique({
      where: { id: id }
    })

    if(!transactionData) return null;

    const category = await categoryRepo.findCategoryById(transactionData.categoryId);

    const transaction = new Transaction(
      transactionData.description ?? undefined,
      category!,
      transactionData.value,
      transactionData.date,
      transactionData.recurrence,
      transactionData.userId
    );

    return transaction;
  }

  async findUserTransactions(userId: string) {
    const transactionData = await prisma.transaction.findMany({
      where: { userId }
    });

    if(!transactionData || transactionData.length === 0) return null;

    const transactions : Transaction[] = [];

    for (const td of transactionData) {
      const category = await categoryRepo.findCategoryById(td.categoryId);

      const transaction = new Transaction(
        td.description ?? undefined,
        category!,
        td.value,
        td.date,
        td.recurrence,
        td.userId
      );

      transactions.push(transaction);
    }

    return transactions;
  }

  async findTransactionsByDate(begin: Date, until: Date ) {
    const transactionData = await prisma.transaction.findMany({
      where: {
        date: {
          gt: begin,
          lte: until
        }
      }
    });

    if(!transactionData || transactionData.length === 0) return null;

    const transactions : Transaction[] = [];

    for (const td of transactionData) {
      const category = await categoryRepo.findCategoryById(td.categoryId);

      const transaction = new Transaction(
        td.description ?? undefined,
        category!,
        td.value,
        td.date,
        td.recurrence,
        td.userId
      );

      transactions.push(transaction);
    }

    return transactions;
  }

  async findTransactionOccurency(transaction : Transaction, userId : string) {
    const transactionData = await prisma.transaction.findMany({
      where: {
        userId: userId,
        date : transaction.date,
        categoryId : transaction.category.id,
        value : transaction.value
      }
    });

     if(!transactionData || transactionData.length === 0) return null;

    const transactions : Transaction[] = [];

    for (const td of transactionData) {
      const category = await categoryRepo.findCategoryById(td.categoryId);

      const transaction = new Transaction(
        td.description ?? undefined,
        category!,
        td.value,
        td.date,
        td.recurrence,
        td.userId
      );

      transactions.push(transaction);
    }

    return transactions;
  }

  async delete(id : number){
    return prisma.transaction.delete({
      where: { id }
    })
  }

  async updateDescription(id : number, newDescription : string){
    return prisma.transaction.update({
      where: { id },
      data: { description: newDescription }
    })
  }

  async updateValue(id : number, newValue : number){
    return prisma.transaction.update({
      where: { id },
      data: { value: newValue }
    })
  }

  async updateDate(id : number, newDate : Date){
    return prisma.transaction.update({
      where: { id },
      data: { date: newDate }
    })
  }

  async updateCategoty(id : number, newCategoryId : number){
    return prisma.transaction.update({
      where: { id },
      data: { categoryId: newCategoryId }
    })
  }

  async updateRecurrence(id : number, newRecurrence : boolean){
    return prisma.transaction.update({
      where: { id : id },
      data: { recurrence: newRecurrence }
    })
  }
}

export class InvestmentRepository {
  async create(investment : Investment){
    const transactionData = await prisma.investment.create({
      data: {
        description : investment.description,
        value : investment.value, 
        date : investment.date,
        recurrence : investment.recurrence,
        rate : investment.rate,
        entrace : investment.entrance,
        recurrenceAdd : investment.recurrenceAdd,
        monthsDuration : investment.monthsDuration,
        categoryId : investment.category.id,
        userId : investment.userId
      }
    })

    investment.id = transactionData.id

    return investment;
  }

  async findInvestmentById(id: number) {
    const investmentData = await prisma.investment.findUnique({
      where: { id: id }
    })

    if(!investmentData) return null;

    const category = await categoryRepo.findCategoryById(investmentData.categoryId);

    const investment = await Investment.create(
      investmentData.description ?? undefined,
      investmentData.value,
      investmentData.date,
      investmentData.recurrence,
      investmentData.userId,
      investmentData.rate,
      investmentData.entrace,
      investmentData.recurrenceAdd,
      investmentData.monthsDuration
    );

    return investment;
  }

  async findUserInvestments(userId: string) {
    const investmentData = await prisma.investment.findMany({
      where: { userId }
    });

    if(!investmentData || investmentData.length === 0) return null;

    const investments : Investment[] = [];

    const category = await categoryRepo.findCategoryByLabel( userId,'Investment');
    for (const ivd of investmentData) {
      
      const investment = await Investment.create(
        ivd.description ?? undefined,
        ivd.value,
        ivd.date,
        ivd.recurrence,
        ivd.userId,
        ivd.rate,
        ivd.entrace,
        ivd.recurrenceAdd,
        ivd.monthsDuration
      );

      investments.push(investment);
    }

    return investments;
  }

  async delete(id : number){
    return prisma.transaction.delete({
      where: { id }
    })
  }

  async updateDescription(id : number, newDescription : string){
    return prisma.investment.update({
      where: { id },
      data: { description: newDescription }
    })
  }

  async updateValue(id : number, newValue : number){
    return prisma.investment.update({
      where: { id },
      data: { value: newValue }
    })
  }

  async updateDate(id : number, newDate : Date){
    return prisma.investment.update({
      where: { id },
      data: { date: newDate }
    })
  }

  async updateRecurrence(id : number, newRecurrence : boolean){
    return prisma.investment.update({
      where: { id : id },
      data: { recurrence: newRecurrence }
    })
  }

  async updateRate(id : number, newRate : number){
    return prisma.investment.update({
      where: { id : id },
      data: { rate: newRate }
    })
  }

  async updateRecurrenceAdd(id : number, newRecurrenceAdd : number){
    return prisma.investment.update({
      where: { id : id },
      data: { recurrenceAdd: newRecurrenceAdd }
    })
  }

  async updateMonthsDuration(id : number, newMonthsDuration : number){
    return prisma.investment.update({
      where: { id : id },
      data: { monthsDuration: newMonthsDuration }
    })
  }
}