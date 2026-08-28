-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "storeName" TEXT NOT NULL DEFAULT '{{STORE_NAME}}',
    "supportEmail" TEXT,
    "discordUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);
