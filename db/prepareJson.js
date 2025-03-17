/**
 * Script to filter a JSON object, keeping only one specified attribute. 
 * Usage: node filter-json.js <input-file.json> <attribute-to-keep>
 * Or: ./filter-json.js <input-file.json> <attribute-to-keep> (if file is executable)
 */

import fs from 'fs';

function keepOneAttribute(jsonObject, attributeToKeep) {
  // Check if the input is valid
  if (!jsonObject || typeof jsonObject !== 'object') {
    throw new Error('Input must be a valid object');
  }

  if (!attributeToKeep || typeof attributeToKeep !== 'string') {
    throw new Error('Attribute name must be a valid string');
  }

  // Check if the attribute exists in the object
  if (!(attributeToKeep in jsonObject)) {
    throw new Error(`Attribute "${attributeToKeep}" does not exist in the object`);
  }

  // Create a new object with only the specified attribute
  return { [attributeToKeep]: jsonObject[attributeToKeep] };
}

// Process command line arguments
const args = process.argv.slice(2);

if (args.length < 2 || args.length > 3) {
  console.error('Usage: node filter-json.js <input-file.json> <attribute-to-keep> or Usage: node filter-json.js <input-file.json> <attribute-to-keep> <path-to-new-file.json>');
  console.error(args.length)
  process.exit(1);
}

const [inputFile, attributeToKeep] = args;
let newFilePath = `./courses.json`

if (args.length === 3) {
  newFilePath = args[2];
}

try {
  // Read the input JSON file
  const data = fs.readFileSync(inputFile, 'utf8');
  const jsonObject = JSON.parse(data);

  // Process the JSON
  const result = keepOneAttribute(jsonObject, attributeToKeep);

  //Write to new JSON
  fs.writeFileSync(newFilePath, JSON.stringify(result, null, 2))
  // Output the result to stdout
  console.log(`printed to : ${newFilePath.substring(2)}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}