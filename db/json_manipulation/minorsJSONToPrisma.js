import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Read the minors.json file
const minorsData = JSON.parse(fs.readFileSync('./minors.json', 'utf8'));

// Map to store department name to ID mapping
const departmentMap = {};

/**
 * Get or create a department ID for a given department name
 * @param {string} deptName - The department name
 * @returns {Promise<number>} - The department ID
 */
async function getDepartmentId(deptName) {
  // If we already have the department ID cached, return it
  if (departmentMap[deptName]) {
    return departmentMap[deptName];
  }

  // Find the department in the database
  const department = await prisma.department.findFirst({
    where: { name: deptName }
  });

  // If department exists, cache and return its ID
  if (department) {
    departmentMap[deptName] = department.id;
    return department.id;
  }

  // If department doesn't exist, create it
  const newDepartment = await prisma.department.create({
    data: { name: deptName }
  });

  // Cache and return the new department ID
  departmentMap[deptName] = newDepartment.id;
  return newDepartment.id;
}

/**
 * Extract department name from minor name
 * @param {string} minorName - The minor name
 * @returns {string} - The department name
 */
function extractDepartmentName(minorName) {
  // Map minor names to department names
  const deptMappings = {
    'Cyber Operations Core': 'Computer Science',
    'Christian Education Minor': 'Biblical Studies',
    'Marketing Minor': 'Business',
    'Christian Ministries Management Minor': 'Business',
    'International Business Minor': 'Business',
    'Music Minor': 'Music',
    'Church History Minor': 'Biblical Studies',
    'Comprehensive Communication Arts Minor': 'Communications',
    'Criminal Justice Minor': 'Social Sciences',
    'Broadcasting and Digital Media Minor': 'Communications',
    'Psychology Minor': 'Psychology',
    'Geology Minor': 'Science',
    'Graphic Design Minor': 'Art'
  };

  return deptMappings[minorName] || 'General';
}

/**
 * Extract credits from minor definition
 * @param {Object} minor - The minor object
 * @returns {number} - The credits as a number
 */
function extractCredits(minor) {
  const credits = minor.credits;
  if (!credits || credits === '0') return 0;
  return parseFloat(credits);
}

/**
 * Main function to process minors and generate Prisma statements
 */
async function processMinors() {
  const minors = minorsData.minors;
  const createManyData = [];

  // Process each minor
  for (const minor of minors) {
    const name = minor.name;
    const departmentName = extractDepartmentName(name);
    const deptId = await getDepartmentId(departmentName);
    const credits = extractCredits(minor);

    createManyData.push({
      name,
      dept_id: deptId,
      // Add credits if available
      ...(credits > 0 && { num_credits: credits })
    });
  }

  // Generate and print create many statement
  console.log('// Prisma createMany statement for minors');
  console.log('const minors = await prisma.minor.createMany({');
  console.log('  data: [');
  createManyData.forEach((minor, index) => {
    const isLast = index === createManyData.length - 1;
    console.log(`    {
      name: "${minor.name}",
      dept_id: ${minor.dept_id}${minor.num_credits ? `,
      num_credits: ${minor.num_credits}` : ''}
    }${isLast ? '' : ','}`);
  });
  console.log('  ],');
  console.log('  skipDuplicates: true,');
  console.log('});');
}

/**
 * Run the script
 */
async function main() {
  try {
    await processMinors();
  } catch (error) {
    console.error('Error processing minors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();