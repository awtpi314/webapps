import * as fs from "fs";
import * as path from "path";

const filePath = path.join(__dirname, "..", "student_eval.json");

function readStudentEvaluation(): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading student_eval.json:", err);
        reject(err);
        return;
      }

      try {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        reject(parseError);
      }
    });
  });
}

async function main() {
  try {
    const studentData = await readStudentEvaluation();

    const departmentsSet = new Set<string>();
    studentData["ActivePrograms"].forEach((program: any) => {
      if (program["Departments"]) {
        program["Departments"].forEach((department: string) => {
          departmentsSet.add(department);
        });
      }
    });

    console.log("Departments:", Array.from(departmentsSet).join(", "));
  } catch (error) {
    console.error("Failed to load student evaluation data:", error);
  }
}

main();
