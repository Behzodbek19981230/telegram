-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('DIRECT', 'GROUP');

-- AlterTable: add new columns first (old userAId/userBId still present)
ALTER TABLE "Chat" ADD COLUMN     "name" TEXT,
ADD COLUMN     "type" "ChatType" NOT NULL DEFAULT 'DIRECT';

-- CreateTable
CREATE TABLE "ChatMember" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMember_pkey" PRIMARY KEY ("id")
);

-- Backfill: turn each existing direct Chat's userAId/userBId into ChatMember rows
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO "ChatMember" ("id", "chatId", "userId", "lastReadAt", "joinedAt")
SELECT gen_random_uuid(), "id", "userAId", "updatedAt", "createdAt" FROM "Chat";

INSERT INTO "ChatMember" ("id", "chatId", "userId", "lastReadAt", "joinedAt")
SELECT gen_random_uuid(), "id", "userBId", "updatedAt", "createdAt" FROM "Chat";

-- CreateIndex
CREATE UNIQUE INDEX "ChatMember_chatId_userId_key" ON "ChatMember"("chatId", "userId");

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userAId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userBId_fkey";

-- DropIndex
DROP INDEX "Chat_userAId_userBId_key";

-- AlterTable: now safe to drop the old columns
ALTER TABLE "Chat" DROP COLUMN "userAId",
DROP COLUMN "userBId";
