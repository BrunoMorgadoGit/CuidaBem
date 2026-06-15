-- CreateTable
CREATE TABLE `tasks` (
    `id` CHAR(36) NOT NULL,
    `patient_id` CHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `detail` TEXT NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `priority` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'next',
    `icon` VARCHAR(191) NOT NULL,
    `guide_id` VARCHAR(191) NULL,
    `guide_route` VARCHAR(191) NULL,
    `created_by_user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_by_user_id` CHAR(36) NULL,
    `completed_at` DATETIME(3) NULL,

    INDEX `tasks_patient_id_idx`(`patient_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_templates` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `guide_route` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_logs` (
    `id` CHAR(36) NOT NULL,
    `patient_id` CHAR(36) NOT NULL,
    `task_id` CHAR(36) NULL,
    `action` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `performed_by_user_id` CHAR(36) NOT NULL,
    `performed_by_name` VARCHAR(191) NOT NULL,
    `performed_by_role` VARCHAR(191) NOT NULL,
    `performed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `details` JSON NULL,

    INDEX `activity_logs_patient_id_idx`(`patient_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
