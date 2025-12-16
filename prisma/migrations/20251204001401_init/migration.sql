-- CreateTable
CREATE TABLE "Startup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "companyName" TEXT,
    "university" TEXT,
    "contactLinkedIn" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactWebsite" TEXT,
    "teamMembers" TEXT NOT NULL,
    "milestones" TEXT,
    "pitchDeck" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
