import { PrismaClient, TransactionType } from '@prisma/client'
import bcrypt from "bcryptjs";
import { User } from '../entities/user';
import { TransactionCategory } from '../entities/transactions/transactionCategory';
import { Transaction } from '../entities/transactions/transaction';

const prisma = new PrismaClient();

export class UserRepository {
  async create(user : User){

    const hashPassword : string = await bcrypt.hash(user.password, 10);

    return prisma.user.create({
      data:{ name : user.name, 
        email : user.email,
        password : hashPassword 
       }
    })
  }

  async listUsers() {
    return prisma.user.findMany();
  }

  async findUser(id: string) {
    return prisma.user.findUnique({
      where: { id: id }
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
    return prisma.user.update({
      where: { id },
      data: { password: newPassword }
    });
  }
}

export class TransactionCategoryRepository {
  async create(category : TransactionCategory, user : User){
    return prisma.transactionCategory.create({
      data: {
        label : category.label, 
        type : category.type,
        userId : user.id
      }
    })
  }
  
  async findCategory(id: number) {
    return prisma.transactionCategory.findUnique({
      where: { id: id }
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
    return prisma.transaction.create({
      data: {
        value : transaction.value, 
        date : transaction.date,
        categoryId : transaction.category.id,
        userId : user.id 
      }
    })
  }

  async findTransaction(id: number) {
    return prisma.transaction.findUnique({
      where: { id: id }
    })
  }

  async findUserTransactions(userId: string) {
    return prisma.transaction.findMany({
      where: { userId }
    })
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