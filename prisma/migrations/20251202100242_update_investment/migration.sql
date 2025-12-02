/*
  Warnings:

  - You are about to drop the column `entrace` on the `Investment` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Investment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT,
    "value" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "recurrence" BOOLEAN NOT NULL,
    "rate" REAL NOT NULL,
    "recurrenceAdd" REAL NOT NULL,
    "monthsDuration" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Investment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TransactionCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Investment" ("categoryId", "date", "description", "id", "monthsDuration", "rate", "recurrence", "recurrenceAdd", "userId", "value") SELECT "categoryId", "date", "description", "id", "monthsDuration", "rate", "recurrence", "recurrenceAdd", "userId", "value" FROM "Investment";
DROP TABLE "Investment";
ALTER TABLE "new_Investment" RENAME TO "Investment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
