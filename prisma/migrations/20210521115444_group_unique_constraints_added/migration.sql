/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `groups` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "groups.name_unique" ON "groups"("name");
