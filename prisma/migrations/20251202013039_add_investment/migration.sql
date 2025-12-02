-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "description" TEXT;

-- CreateTable
CREATE TABLE "Investment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT,
    "value" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "recurrence" BOOLEAN NOT NULL,
    "rate" REAL NOT NULL,
    "entrace" REAL NOT NULL,
    "recurrenceAdd" REAL NOT NULL,
    "monthsDuration" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Investment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TransactionCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
