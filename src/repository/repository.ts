import { PrismaClient, TransactionType } from '@prisma/client'
import bcrypt from "bcryptjs";
import { User } from '../entities/user';
import { TransactionCategory } from '../entities/transactions/transactionCategory';
import { Transaction } from '../entities/transactions/transaction';

const prisma = new PrismaClient();

export class UserRepository {
  async create(user : User){

    const userOnDb = await this.findUserByEmail(user.email);

    if (userOnDb) {
      throw new Error("Email already registered!");
    }

    const hashPassword : string = await bcrypt.hash(user.password, 10);

    return prisma.user.create({
      data:{ name : user.name, 
        email : user.email,
        password : hashPassword 
       }
    })
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id: id }
    })
  }

  async findUserByName(name: string) {
    return prisma.user.findMany({
      where: { name: name }
    })
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email }
    })
  }

  async updateName(id: string, newName: string) {
    return prisma.user.update({
      where: { id },
      data: { name: newName }
    });
  }

  async updateEmail(id: string, newEmail: string) {
    return prisma.user.update({
      where: { id },
      data: { email: newEmail }
    });
  }

  async updatePassword(id: string, newPassword: string) {
    const hashPassword : string = await bcrypt.hash(newPassword, 10);

    return prisma.user.update({
      where: { id },
      data: { password: hashPassword }
    });
  }
}

export class TransactionCategoryRepository {
  async create(category : TransactionCategory, user : User){
    const normalizedLabel = category.label.toLowerCase().trim();
    const categories = await this.findCategories(normalizedLabel, category.type, user.id);

    if(categories.length > 0) {
      throw new Error("Category already registered");
    }

    return await this.createByPass(category,user);
  }

  async createByPass(category : TransactionCategory, user : User){
    const normalizedLabel = category.label.toLowerCase().trim();

    return prisma.transactionCategory.create({
      data: {
        label : normalizedLabel, 
        type : category.type,
        userId : user.id
      }
    })
  }

  async findCategoryById(id: number) {
    return prisma.transactionCategory.findUnique({
      where: { id: id }
    })
  }
  
  async findCategories(label: string, type : TransactionType, userId : string) {
    const normalizedLabel = label.toLowerCase().trim();

    return prisma.transactionCategory.findMany({
      where: {
        userId : userId,
        type : type, 
        label: normalizedLabel
       }
    })
  }

  async findUserCategories(userId: string) {
    return prisma.transactionCategory.findMany({
      where: { userId }
    })
  }

  async delete(id : number){
    return prisma.transactionCategory.delete({
      where: { id }
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
  async create(transaction : Transaction, user : User){

    const transactionOccurrency = await this.findTransactionOccurency(transaction, user.id);

    if(transactionOccurrency.length > 0){
      throw new Error("Another transaction was found!");
    }

    return prisma.transaction.create({
      data: {
        value : transaction.value, 
        date : transaction.date,
        categoryId : transaction.category.id,
        userId : user.id 
      }
    })
  }

  async findTransactionById(id: number) {
    return prisma.transaction.findUnique({
      where: { id: id }
    })
  }

  async findUserTransactions(userId: string) {
    return prisma.transaction.findMany({
      where: { userId }
    })
  }

  async findTransactionsByDate(begin: Date, until: Date ) {
    return prisma.transaction.findMany({
      where: {
        date: {
          gt: begin,
          lte: until
        }
      }
    });
  }

  async findTransactionOccurency(transaction : Transaction, userId : string) {
    return prisma.transaction.findMany({
      where: {
        userId: userId,
        date : transaction.date,
        categoryId : transaction.category.id,
        value : transaction.value
      }
    });
  }

  async delete(id : number){
    return prisma.transaction.delete({
      where: { id }
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
}