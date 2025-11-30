/*
  Warnings:

  - You are about to drop the column `label` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `date` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TransactionCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("categoryId", "id", "userId") SELECT "categoryId", "id", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
