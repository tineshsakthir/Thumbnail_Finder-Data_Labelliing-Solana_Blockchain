-- CreateTable
CREATE TABLE "DataLabelSubmissionCache" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "submittedImagesUrl" TEXT[],

    CONSTRAINT "DataLabelSubmissionCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThumbnailSubmissionCache" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "thumbnailChoosenCount" JSONB NOT NULL,

    CONSTRAINT "ThumbnailSubmissionCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataLabelSubmissionCache_task_id_key" ON "DataLabelSubmissionCache"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "ThumbnailSubmissionCache_task_id_key" ON "ThumbnailSubmissionCache"("task_id");
