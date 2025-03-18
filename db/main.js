import fs from "fs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    // Read the courses.json file
    const coursesData = JSON.parse(fs.readFileSync("json_manipulation/courses.json", "utf8"));
    
    // Ensure we have a catalog entry for the current year
    const currentYear = new Date().getFullYear();
    let catalog = await prisma.catalog.findFirst({
      where: { year: currentYear },
    });

    if (!catalog) {
      catalog = await prisma.catalog.create({
        data: { year: currentYear },
      });
      console.log(
        `Created catalog for year ${currentYear} with ID: ${catalog.id}`
      );
    } else {
      console.log(
        `Using existing catalog for year ${currentYear} with ID: ${catalog.id}`
      );
    }
    
    // Process each course in the JSON file
    for (const courseData of coursesData.CourseFullModels) {
      await populateEquivalencies(courseData);
      // Check if the course already exists to avoid duplicates
      const existingCourse = await prisma.course.findFirst({
        where: {
          subject_code: courseData.SubjectCode,
          number: courseData.Number,
        },
      });

      await populateCourseReqs(courseData);
      // Handle course equivalencies if they exist 

      if (existingCourse) {
        console.log(
          `Course ${courseData.SubjectCode} ${courseData.Number} already exists with ID: ${existingCourse.id}`
        );
        continue;
      }

      // Create the course
      const course = await prisma.course.create({
        data: {
          id: parseInt(courseData.Id),
          subject_code: courseData.SubjectCode,
          number: courseData.Number,
          min_credits: courseData.MinimumCredits,
          max_credits: courseData.MaximumCredits || courseData.MinimumCredits, // If max is null, use min
          title: courseData.Title,
          description: courseData.Description,
          years_offered: courseData.YearsOffered,
          terms_offered: courseData.TermsOffered,
        },
      });

      console.log(
        `Created course: ${courseData.SubjectCode} ${courseData.Number} with ID: ${course.id}`
      );


    }

    await populateMinor();
    await populateMajor();
    console.log("Database population completed successfully");
  } catch (error) {
    console.error("Error populating database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

async function populateCourseReqs(courseData) {
  if (courseData.CourseRequisites.length > 0) {
    courseData.CourseRequisites.forEach(requisite => {
      let coreq = false;
      if (requisite.DisplayTextExtension.includes('either')) {
        //coreq
        coreq = true;
      } else if (requisite.DisplayTextExtension.includes('prior')) {
        //prereq
        coreq = false;
      } else {
        console.error(`Requisite : ${requisite} neither prereq or coreq`)
      }
      requisite.DisplayText.split(" ").forEach(async (course) => {

        if (/\d/.test(course)) {
          const prereq = await prisma.course.findFirst({
            where: {
              subject_code: course.split("-")[0],
              number: course.split("-")[1]
            }
          })

          if (prereq === null) {
            console.log(`Prereq : ${course} - not found`);
            return;
          }

          const existingPrereq = await prisma.prereq.findFirst({
            where: {
              course_id: courseData.id,
              prereq_id: prereq.id
            }
          })

          if (existingPrereq) {
            console.log(
              `Prereq ${existingPrereq.course_id} ${existingPrereq.prereq_id} already exists with ID: ${existingPrereq.id}`
            );
          } else {
            await prisma.prereq.create({
              data: {
                course_id: parseInt(courseData.Id),
                prereq_id: prereq.id,
                coreq: coreq
              }
            })
          }
        }

      })

    });
  }
}
async function populateMajor() {
  const majorData = JSON.parse(fs.readFileSync('json_manipulation/majors.json', 'utf8'));

  for (const major of majorData.majors) {
    const name = major.name;
    let credits = major.credits;
    if (!credits || credits === '0') credits = 0;
    credits = parseFloat(credits);


    let existingMajor = await prisma.major.findFirst({
      where: { name: name }
    })

    if (existingMajor) {
      console.log(
        `Minor ${name} already exist at id ${existingMajor.id}`
      )
    } else {
      existingMajor = await prisma.major.create({
        data: {
          name,
          // Add credits if available
          ...(credits > 0 && { credits: parseInt(credits) })
        }
      });
    }
    await processMajorReqs(major, existingMajor.id);
  }
}

async function processMajorReqs(majorData, majorId) {
  for (const reqs of majorData.children) {
    if (reqs.type === "course") {
      const [subjCode, number] = reqs.name.split('-');

      const course = await prisma.course.findFirst({
        where: {
          subject_code: subjCode,
          number: number
        }
      });

      const elective = reqs.needed;

      if (course) {

        const existingMajorReq = await prisma.major_requirements.findFirst({
          where: {
            course_id: course.id,
            major_id: majorId
          }
        })

        if (existingMajorReq) {
          console.log(
            `Major Requirement with course ${course.id} and major ${majorId} already exists with id ${existingMajorReq.id}`
          );
        } else {
          await prisma.major_requirements.create({
            data: {
              elective: elective,
              course_id: course.id,
              major_id: majorId,
            }
          });
        }
      }
    } else if (reqs.type === "group" && reqs.needed) {
      await processMajorReqs(reqs, majorId);
    }
  }

}


async function populateMinor() {
  const minorData = JSON.parse(fs.readFileSync('json_manipulation/minors.json', 'utf8'));

  for (const minor of minorData.minors) {
    const name = minor.name;
    let credits = minor.credits;
    if (!credits || credits === '0') credits = 0;
    credits = parseFloat(credits);


    let existingMinor = await prisma.minor.findFirst({
      where: { name: name }
    })

    if (existingMinor) {
      console.log(
        `Minor ${name} already exist at id ${existingMinor.id}`
      )
    } else {
      existingMinor = await prisma.minor.create({
        data: {
          name,
          // Add credits if available
          ...(credits > 0 && { credits: parseInt(credits) })
        }
      });
    }
    await processMinorReqs(minor, existingMinor.id);
  }
}

async function processMinorReqs(minorData, minorId) {
  for (const reqs of minorData.children) {
    if (reqs.type === "course") {
      const [subjCode, number] = reqs.name.split('-');

      const course = await prisma.course.findFirst({
        where: {
          subject_code: subjCode,
          number: number
        }
      });

      const elective = reqs.needed;

      if (course) {

        const existingMinorReq = await prisma.minor_requirements.findFirst({
          where: {
            course_id: course.id,
            minor_id: minorId
          }
        })

        if (existingMinorReq) {
          console.log(
            `Minor Requirement with course ${course.id} and minor ${minorId} already exists with id ${existingMinorReq.id}`
          );
        } else {
          await prisma.minor_requirements.create({
            data: {
              elective: elective,
              course_id: course.id,
              minor_id: minorId,
            }
          });
        }
      }
    } else if (reqs.type === "group" && reqs.needed) {
      await processMinorReqs(reqs, minorId);
    }
  }

}

async function populateEquivalencies(courseData) {
  if (courseData.EquatedCourseIds) {
    for (const equatedCourseId of courseData.EquatedCourseIds) {
      // Parse the equated course ID to extract subject code and number
      // Assuming format like "ACCT_211" where we need to split by underscore
      // Can also be in form #### where digits are course id
      if (equatedCourseId.match(/^\d+$/)) {
        const eqCourse = await prisma.course.findFirst({
          where: {
            id: parseInt(equatedCourseId),
          },
        });

        if (!eqCourse) {
          console.error(
            `Course with ID ${equatedCourseId} does not exist for equivalency with ${courseData.SubjectCode} ${courseData.Number}`
          );
          continue;
        }

        // Create the equivalency relationship
        await prisma.equal_courses.create({
          data: {
            course_id: courseData.Id,
            eq_course_id: eqCourse.id,
          },
        });
      } else if (equatedCourseId.match(/^\S+_\d+$/)) {
        const [eqSubjectCode, eqNumber] = equatedCourseId.split("_");

        // Check if the equivalent course exists
        const eqCourse = await prisma.course.findFirst({
          where: {
            subject_code: eqSubjectCode,
            number: eqNumber,
          },
        });

        if (!eqCourse) {
          console.error(
            `Course with ID ${equatedCourseId} does not exist for equivalency with ${courseData.SubjectCode} ${courseData.Number}`
          );
          continue;
        }

        // Create the equivalency relationship
        await prisma.equal_courses.create({
          data: {
            course_id: courseData.Id,
            eq_course_id: eqCourse.id,
          },
        });
      }
    }
  }
}