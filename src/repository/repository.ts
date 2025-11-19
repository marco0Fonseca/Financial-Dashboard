import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

// export class UserRepository {
//   async save(user : User){
//     return prisma.user.create({
//       data:{ name : user.name },
//     })
//   }

//   async listUsers() {
//     return prisma.user.findMany();
//   }

//   async findUser(id: number) {
//     return prisma.user.findFirst({
//       where: { id: id },
//       include : {tasks : true}
//     })
//   }
// }

// export class TaskRepository {
//   async save(task : Task, userId : number){
//     return prisma.task.create({
//       data: {
//         title : task.title, 
//         toDo : task.toDo, 
//         deadLine : task.deadLine,
//         userId 
//       },
//     })
//   } 
// }