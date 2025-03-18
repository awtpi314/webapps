import fs from 'fs';

let majors = [
    "Computer Science", "Computer Engineering", "Chemistry (BS)", "Electrical Engineering",
    "Mathematics (BS)", "Mechanical Engineering", "Physics (BS)", "Physics (BA)",
    "Mathematics (BA)", "Chemistry (BA)", "Biology (BS)", "Biology (BA)", "Environmental Science",
    "Forensic Science", "Geology", "Mathematics Education - Integrated", "Molecular Biology",
    "Chemistry Education", "Geoscience", "Physical Science Education", "Physics Education",
    "Science Comprehensive Education", "Life Science Education", "Accounting", "Finance",
    "Management", "Marketing", "Journalism", "Worship", "International Business",
    "Broadcasting and Digital Media", "Technical and Professional Communication", "Composition",
    "Music", "Performance", "Music Education", "Psychology", "Bible Teacher Education",
    "Christian Education", "Intercultural Studies - Missiology", "Pastoral Studies",
    "Youth Ministries", "American Studies", "History", "Criminal Justice", "Biblical Studies",
    "Political Science", "Prelaw", "Public Administration", "Social Studies Education",
    "International Studies", "Preagriculture", "Sociology", "Graphic Design",
    "Information Technology Management", "Sport Business Management",
    "History and Political Science", "Communication", "Economics (BA)", "Economics (BS)",
    "Civil Engineering", "Cyber Operations", "CSCY Double"
];

let minors = [
    "Bible", "Math", "Computer Science", "Bio-Medical Engineering", "Pre-Pharmacy", "Economics",
    "Actuarial Science", "Bioethics", "Biology", "Chemistry", "Earth Science", "Physics",
    "Christian Education", "Greek", "Mission", "Preseminary", "Women's Ministry", "Youth Ministry",
    "Marketing", "Information Technology Management", "Business Administration for non-business majors",
    "Christian Ministries Management for non-business majors", "International Business for business majors",
    "International Business for non-business majors", "Music", "Asian Studies", "Church History",
    "Coaching", "Comprehensive Communication Arts", "Creative Web Design", "Creative Writing",
    "Criminal Justice", "Cross-Cultural Nursing", "Digital Film", "Digital Photography",
    "Broadcasting and Digital Media", "French", "Psychology", "Geology", "German", "Graphic Design",
    "Motion Graphics", "History", "Intercultural Communication", "Honors Program", "Latin American Studies",
    "Literature", "Middle Eastern Studies", "Organizational Communication", "Political Science",
    "Public Administration", "Sociology", "Spanish", "Spanish for Professionals", "Sport Management",
    "Sport Ministry", "TESOL Endorsement", "TESOL Minor", "Western European Studies", "Writing for the Professions",
    "Agriculture Business Emphasis", "Agriculture Science Emphasis", "Environmental Biology Emphasis",
    "Premed", "Cooperative Education", "Army ROTC", "Air Force ROTC", "Prephysical Therapy", "Worship",
    "Theater", "Public Policy", "Philosophy and Religion", "Music Technology", "Entrepreneurship",
    "Pastoral Ministry", "Bible Teacher Education", "Prevet", "PrePA", "Business Analytics"
];

const args = process.argv.slice(2);

if (args.length > 0) {
    console.error('Usage: node filter-json.js');
    console.error(args.length)
    process.exit(1);
}

let newFilePath = `./reduced.json`

function reduceToMajors(courseArr) {
    let majorReqs = [];
    let majorsExcluded = majors;
    let majorsIncluded = [];
    // Check if the input is valid
    if (!courseArr || typeof courseArr !== 'object') {
        throw new Error('Input must be a valid object');
    }

    // deleting requirements like Core requirements because I 
    courseArr.forEach(element => {
        if (majorsExcluded.some(major => element.name.includes(major))) {
            //add to new array
            majorReqs.push(element);

            //remove from majorsExcluded
            majorsExcluded = majorsExcluded.filter(major => !element.name.includes(major));
            majorsIncluded.push(element.name);
        }
    });

    return { majors: majorReqs, majorsExcluded: majorsExcluded, majorsIncluded: majorsIncluded };
}

function reduceToMinors(courseArr) {
    let minorReqs = [];
    let minorsExcluded = majors;
    let minorsIncluded = [];
    // Check if the input is valid
    if (!courseArr || typeof courseArr !== 'object') {
        throw new Error('Input must be a valid object');
    }

    // deleting requirements like Core requirements because I 
    courseArr.forEach(element => {
        if (minorsExcluded.some(minor => element.name.includes(minor))) {
            //add to new array
            minorReqs.push(element);

            //remove from majorsExcluded
            minorsExcluded = minorsExcluded.filter(minor => !element.name.includes(minor));
            minorsIncluded.push(element.name);
        }
    });

    return { minors: minorReqs, minorsExcluded: minorsExcluded, minorsIncluded: minorsIncluded };
}

try {
    // Read the input JSON file
    const reducedlength = JSON.parse(fs.readFileSync('./reduced.json', 'utf8')).minors.length;
    console.log("Reduced length: ", reducedlength);
    const data = fs.readFileSync('./raw.json', 'utf8');
    const jsonObject = JSON.parse(data);

    const reqs = jsonObject.data.tree;
    console.log(jsonObject.data.tree.length);
    console.log(majors.length, minors.length);

    const result = reduceToMinors(reqs);
    //Write to new JSON
    fs.writeFileSync(newFilePath, JSON.stringify(result, null, 2))
    // Output the result to stdout
    // console.log(`printed to : ${newFilePath.substring(2)}`);
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
}