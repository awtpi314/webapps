-- CreateTable
CREATE TABLE `__efmigrationshistory` (
    `MigrationId` VARCHAR(150) NOT NULL,
    `ProductVersion` VARCHAR(32) NOT NULL,

    PRIMARY KEY (`MigrationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aspnetroleclaims` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `RoleId` VARCHAR(255) NOT NULL,
    `ClaimType` LONGTEXT NULL,
    `ClaimValue` LONGTEXT NULL,

    INDEX `IX_AspNetRoleClaims_RoleId`(`RoleId`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aspnetroles` (
    `Id` VARCHAR(255) NOT NULL,
    `Name` VARCHAR(256) NULL,
    `NormalizedName` VARCHAR(256) NULL,
    `ConcurrencyStamp` LONGTEXT NULL,

    UNIQUE INDEX `RoleNameIndex`(`NormalizedName`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aspnetuserclaims` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `UserId` VARCHAR(255) NOT NULL,
    `ClaimType` LONGTEXT NULL,
    `ClaimValue` LONGTEXT NULL,

    INDEX `IX_AspNetUserClaims_UserId`(`UserId`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aspnetuserlogins` (
    `LoginProvider` VARCHAR(255) NOT NULL,
    `ProviderKey` VARCHAR(255) NOT NULL,
    `ProviderDisplayName` LONGTEXT NULL,
    `UserId` VARCHAR(255) NOT NULL,

    INDEX `IX_AspNetUserLogins_UserId`(`UserId`),
    PRIMARY KEY (`LoginProvider`, `ProviderKey`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aspnetuserroles` (
    `UserId` VARCHAR(255) NOT NULL,
    `RoleId` VARCHAR(255) NOT NULL,

    INDEX `IX_AspNetUserRoles_RoleId`(`RoleId`),
    PRIMARY KEY (`UserId`, `RoleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aspnetusers` (
    `Id` VARCHAR(255) NOT NULL,
    `UserName` VARCHAR(256) NULL,
    `NormalizedUserName` VARCHAR(256) NULL,
    `Email` VARCHAR(256) NULL,
    `NormalizedEmail` VARCHAR(256) NULL,
    `EmailConfirmed` BOOLEAN NOT NULL,
    `PasswordHash` LONGTEXT NULL,
    `SecurityStamp` LONGTEXT NULL,
    `ConcurrencyStamp` LONGTEXT NULL,
    `PhoneNumber` LONGTEXT NULL,
    `PhoneNumberConfirmed` BOOLEAN NOT NULL,
    `TwoFactorEnabled` BOOLEAN NOT NULL,
    `LockoutEnd` DATETIME(6) NULL,
    `LockoutEnabled` BOOLEAN NOT NULL,
    `AccessFailedCount` INTEGER NOT NULL,

    UNIQUE INDEX `UserNameIndex`(`NormalizedUserName`),
    INDEX `EmailIndex`(`NormalizedEmail`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aspnetusertokens` (
    `UserId` VARCHAR(255) NOT NULL,
    `LoginProvider` VARCHAR(255) NOT NULL,
    `Name` VARCHAR(255) NOT NULL,
    `Value` LONGTEXT NULL,

    PRIMARY KEY (`UserId`, `LoginProvider`, `Name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catalog` (
    `id` VARCHAR(191) NOT NULL,
    `year` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Catalog_year_key`(`year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(4096) NOT NULL,
    `credits` DOUBLE NOT NULL,
    `maxCredits` DOUBLE NULL,
    `stepCredits` DOUBLE NULL,
    `offeredYears` ENUM('ALL_YEARS', 'EVEN_YEARS', 'ODD_YEARS') NOT NULL,
    `seasonsOffered` ENUM('FALL_ONLY', 'SPRING_ONLY', 'FALL_SPRING', 'SUMMER_ONLY', 'FALL_SPRING_SUMMER') NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coursetaken` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `semesterId` VARCHAR(191) NOT NULL,

    INDEX `CourseTaken_courseId_fkey`(`courseId`),
    INDEX `CourseTaken_semesterId_fkey`(`semesterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `department` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Department_name_key`(`name`),
    UNIQUE INDEX `Department_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instructor` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `prefix` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(255) NOT NULL,

    INDEX `Instructor_departmentId_fkey`(`departmentId`),
    INDEX `Instructor_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `advisor` (
    `id` VARCHAR(191) NOT NULL,
    `instructorId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `major` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('BS', 'BA', 'BM', 'BME', 'CERT', 'ND', 'CE', 'DD', 'DHM', 'DNP', 'PHRMD', 'GCRT', 'LTD', 'MAI', 'MMSPA', 'MABL', 'MAWT', 'MAT', 'MSN', 'MTS', 'MBA', 'MDIV', 'MMIN', 'MS') NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `sampleplanId` VARCHAR(191) NULL,

    UNIQUE INDEX `Major_name_key`(`name`),
    INDEX `Major_departmentId_fkey`(`departmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `minor` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('BS', 'BA', 'BM', 'BME', 'CERT', 'ND', 'CE', 'DD', 'DHM', 'DNP', 'PHRMD', 'GCRT', 'LTD', 'MAI', 'MMSPA', 'MABL', 'MAWT', 'MAT', 'MSN', 'MTS', 'MBA', 'MDIV', 'MMIN', 'MS') NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Minor_name_key`(`name`),
    INDEX `Minor_departmentId_fkey`(`departmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NULL,
    `catalogId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,

    INDEX `Plan_catalogId_fkey`(`catalogId`),
    INDEX `Plan_studentId_fkey`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plancategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `credits` DOUBLE NULL,
    `count` INTEGER NULL,
    `wildcard` VARCHAR(191) NULL,
    `planId` VARCHAR(191) NULL,
    `parentCategoryId` VARCHAR(191) NULL,

    INDEX `PlanCategory_parentCategoryId_fkey`(`parentCategoryId`),
    INDEX `PlanCategory_planId_fkey`(`planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planmajors` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `majorId` VARCHAR(191) NOT NULL,

    INDEX `PlanMajors_majorId_fkey`(`majorId`),
    INDEX `PlanMajors_planId_fkey`(`planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planminors` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `minorId` VARCHAR(191) NOT NULL,

    INDEX `PlanMinors_minorId_fkey`(`minorId`),
    INDEX `PlanMinors_planId_fkey`(`planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requisite` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `reqCourse` VARCHAR(191) NOT NULL,
    `type` ENUM('PREREQUISITE', 'CO_REQUISITE') NOT NULL,

    INDEX `Requisite_courseId_fkey`(`courseId`),
    INDEX `Requisite_reqCourse_fkey`(`reqCourse`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `semester` (
    `id` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `season` ENUM('FALL', 'SPRING', 'SUMMER') NOT NULL,
    `planId` VARCHAR(191) NOT NULL,

    INDEX `Semester_planId_fkey`(`planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `majorId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(255) NULL,

    INDEX `Student_majorId_fkey`(`majorId`),
    INDEX `Student_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teaches` (
    `id` VARCHAR(191) NOT NULL,
    `instructorId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,

    INDEX `Teaches_courseId_fkey`(`courseId`),
    INDEX `Teaches_instructorId_fkey`(`instructorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `aspnetroleclaims` ADD CONSTRAINT `FK_AspNetRoleClaims_AspNetRoles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `aspnetroles`(`Id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `aspnetuserclaims` ADD CONSTRAINT `FK_AspNetUserClaims_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `aspnetusers`(`Id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `aspnetuserlogins` ADD CONSTRAINT `FK_AspNetUserLogins_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `aspnetusers`(`Id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `aspnetuserroles` ADD CONSTRAINT `FK_AspNetUserRoles_AspNetRoles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `aspnetroles`(`Id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `aspnetuserroles` ADD CONSTRAINT `FK_AspNetUserRoles_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `aspnetusers`(`Id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `aspnetusertokens` ADD CONSTRAINT `FK_AspNetUserTokens_AspNetUsers_UserId` FOREIGN KEY (`UserId`) REFERENCES `aspnetusers`(`Id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `coursetaken` ADD CONSTRAINT `CourseTaken_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coursetaken` ADD CONSTRAINT `CourseTaken_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `semester`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor` ADD CONSTRAINT `Instructor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `aspnetusers`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor` ADD CONSTRAINT `Instructor_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advisor` ADD CONSTRAINT `Advisor_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advisor` ADD CONSTRAINT `Advisor_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `major` ADD CONSTRAINT `Major_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `minor` ADD CONSTRAINT `Minor_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plan` ADD CONSTRAINT `Plan_catalogId_fkey` FOREIGN KEY (`catalogId`) REFERENCES `catalog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plan` ADD CONSTRAINT `Plan_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plancategory` ADD CONSTRAINT `PlanCategory_parentCategoryId_fkey` FOREIGN KEY (`parentCategoryId`) REFERENCES `plancategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plancategory` ADD CONSTRAINT `PlanCategory_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planmajors` ADD CONSTRAINT `PlanMajors_majorId_fkey` FOREIGN KEY (`majorId`) REFERENCES `major`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planmajors` ADD CONSTRAINT `PlanMajors_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planminors` ADD CONSTRAINT `PlanMinors_minorId_fkey` FOREIGN KEY (`minorId`) REFERENCES `minor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planminors` ADD CONSTRAINT `PlanMinors_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisite` ADD CONSTRAINT `Requisite_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisite` ADD CONSTRAINT `Requisite_reqCourse_fkey` FOREIGN KEY (`reqCourse`) REFERENCES `course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `semester` ADD CONSTRAINT `Semester_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `Student_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `aspnetusers`(`Id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `Student_majorId_fkey` FOREIGN KEY (`majorId`) REFERENCES `major`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teaches` ADD CONSTRAINT `Teaches_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teaches` ADD CONSTRAINT `Teaches_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
