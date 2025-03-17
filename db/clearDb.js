import { PrismaClient } from "@prisma/client";
import readline from "readline";

const prisma = new PrismaClient();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// List of all tables in the database
const tables = [
  "semester_to_course",
  "semester",
  "minor_to_plan",
  "minor_requirements",
  "major_to_plan",
  "major_requirements",
  "equal_courses",
  "plans",
  "user",
  "minor",
  "major",
  "department",
  "course",
  "catalog",
];

/**
 * Function to delete data from a specific table
 */
async function deleteTableData(table) {
  try {
    await prisma[table].deleteMany({});
    console.log(`✅ Successfully cleared all data from ${table}`);
  } catch (error) {
    console.error(`❌ Error clearing data from ${table}:`, error);
  }
}

/**
 * Function to get user confirmation for deleting data
 */
function confirmAction(message) {
  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

/**
 * Main function to execute the database clearing
 */
async function main() {
  console.log("🗄️  Database Table Cleaning Utility");
  console.log("-----------------------------------");

  const clearAll = await confirmAction(
    "Do you want to clear ALL tables? (This will delete ALL data in the database)"
  );

  if (clearAll) {
    console.log(
      "\n⚠️  WARNING: You are about to delete ALL data from ALL tables!"
    );
    const confirmed = await confirmAction(
      "Are you ABSOLUTELY sure? This action cannot be undone"
    );

    if (confirmed) {
      // We need to delete tables in the correct order to respect foreign key constraints
      console.log("\n🔄 Clearing all tables in the correct order...");

      for (const table of tables) {
        await deleteTableData(table);
      }

      console.log("\n✅ All tables have been cleared successfully!");
    } else {
      console.log("\n❌ Operation cancelled.");
    }
  } else {
    console.log("\n📋 Select which tables to clear:");

    for (const table of tables) {
      const shouldClear = await confirmAction(`Clear table '${table}'?`);
      if (shouldClear) {
        await deleteTableData(table);
      } else {
        console.log(`⏭️  Skipping table '${table}'`);
      }
    }

    console.log("\n✅ Selected tables have been cleared!");
  }

  rl.close();
  await prisma.$disconnect();
}

// Run the script
main()
  .catch((e) => {
    console.error("Error in main execution:", e);
    process.exit(1);
  })
  .finally(() => {
    console.log("\n👋 Database cleaning completed.");
  });
