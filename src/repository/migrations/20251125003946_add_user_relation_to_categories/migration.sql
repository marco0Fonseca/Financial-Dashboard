/*
  Warnings:

  - Added the required column `userId` to the `TransactionCategory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TransactionCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TransactionCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TransactionCategory" ("id", "label", "type") SELECT "id", "label", "type" FROM "TransactionCategory";
DROP TABLE "TransactionCategory";
ALTER TABLE "new_TransactionCategory" RENAME TO "TransactionCategory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
