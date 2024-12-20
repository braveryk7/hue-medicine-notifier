-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "light_id" TEXT NOT NULL,
    "light_type" TEXT NOT NULL,
    "utc_offset" INTEGER NOT NULL,
    "registered_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "time_of_day" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "xy_x" REAL,
    "xy_y" REAL,
    "brightness" INTEGER NOT NULL,
    "color_temperature" INTEGER,
    "rgb" TEXT NOT NULL,
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Plan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plan_id" INTEGER NOT NULL,
    "date" INTEGER NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" DATETIME,
    "light_action_count" INTEGER NOT NULL,
    CONSTRAINT "Task_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "medicine_tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PlanMedicineTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PlanMedicineTags_A_fkey" FOREIGN KEY ("A") REFERENCES "medicine_tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PlanMedicineTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Plan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "medicine_tag_name_key" ON "medicine_tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_PlanMedicineTags_AB_unique" ON "_PlanMedicineTags"("A", "B");

-- CreateIndex
CREATE INDEX "_PlanMedicineTags_B_index" ON "_PlanMedicineTags"("B");
