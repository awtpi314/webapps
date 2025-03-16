import { hash, compare } from "bcrypt";
import { createHash } from "crypto";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const password = "password";
const sha256Hash = createHash("sha256").update(password).digest("hex");
const bcryptHash =
  "$2y$10$pvEeml/VHe1qPeioSvO5N.GwsVvoRdijdFMuKGTmUR6t3i3e53FC6";
const genBcryptHash = await hash(sha256Hash, 10);
console.log("SHA256 Hash:", sha256Hash);
console.log("Bcrypt Hash:", bcryptHash);
console.log("Generated Bcrypt Hash:", genBcryptHash);
console.log(
  "Are prepopulated hashes equal?",
  await compare(sha256Hash, bcryptHash)
);
console.log(
  "Are generated hashes equal?",
  await compare(sha256Hash, genBcryptHash)
);

const prisma = new PrismaClient();

async function main() {
  try {
    // Read the courses.json file
    const coursesData = JSON.parse(fs.readFileSync('courses.json', 'utf8'));
    
    // Ensure we have a catalog entry for the current year
    const currentYear = new Date().getFullYear();
    let catalog = await prisma.catalog.findFirst({
      where: { year: currentYear }
    });
    
    if (!catalog) {
      catalog = await prisma.catalog.create({
        data: { year: currentYear }
      });
      console.log(`Created catalog for year ${currentYear} with ID: ${catalog.id}`);
    } else {
      console.log(`Using existing catalog for year ${currentYear} with ID: ${catalog.id}`);
    }
    
    // Process each course in the JSON file
    for (const courseData of coursesData.Courses) {
      // Check if the course already exists to avoid duplicates
      const existingCourse = await prisma.course.findFirst({
        where: {
          subject_code: courseData.SubjectCode,
          number: courseData.Number
        }
      });
      
      if (existingCourse) {
        console.log(`Course ${courseData.SubjectCode} ${courseData.Number} already exists with ID: ${existingCourse.id}`);
        continue;
      }
      
      // Create the course
      const course = await prisma.course.create({
        data: {
          subject_code: courseData.SubjectCode,
          number: courseData.Number,
          min_credits: courseData.MinimumCredits,
          max_credits: courseData.MaximumCredits || courseData.MinimumCredits, // If max is null, use min
          title: courseData.Title,
          description: courseData.Description,
          years_offered: courseData.YearsOffered,
          terms_offered: courseData.TermsOffered
        }
      });
      
      console.log(`Created course: ${courseData.SubjectCode} ${courseData.Number} with ID: ${course.id}`);
      
      // Handle course equivalencies if they exist
      if (courseData.EquatedCourseIds && courseData.EquatedCourseIds.length > 0) {
        for (const equatedCourseId of courseData.EquatedCourseIds) {
          // Parse the equated course ID to extract subject code and number
          // Assuming format like "ACCT_211" where we need to split by underscore
          const [eqSubjectCode, eqNumber] = equatedCourseId.split('_');
          
          // Check if the equivalent course exists
          let eqCourse = await prisma.course.findFirst({
            where: {
              subject_code: eqSubjectCode,
              number: eqNumber
            }
          });
          
          // If equivalent course doesn't exist, create a placeholder
          if (!eqCourse) {
            eqCourse = await prisma.course.create({
              data: {
                subject_code: eqSubjectCode,
                number: eqNumber,
                title: `Equivalent to ${courseData.SubjectCode} ${courseData.Number}`,
                min_credits: courseData.MinimumCredits,
                max_credits: courseData.MaximumCredits || courseData.MinimumCredits
              }
            });
            console.log(`Created placeholder for equivalent course: ${eqSubjectCode} ${eqNumber} with ID: ${eqCourse.id}`);
          }
          
          // Create the equivalency relationship
          await prisma.equal_courses.create({
            data: {
              course_id: course.id,
              eq_course_id: eqCourse.id
            }
          });
          console.log(`Created equivalency between courses: ${course.id} and ${eqCourse.id}`);
        }
      }
    }
    
    console.log('Database population completed successfully');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });