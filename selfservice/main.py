import asyncio
import json
import re

from prisma.enums import (DegreeType, OfferedYears, RequisiteType,
                          SeasonsOffered)
from selenium import webdriver

from prisma import Prisma


async def main() -> None:

    # ENTER YOUR USER ID HERE
    user_id =

    driver = webdriver.Chrome()
    driver.get(
        "https://selfservice.cedarville.edu/Student/Planning/Programs/MyProgress"
    )

    input("Press Enter once you have authenticated...")

    current_plan = driver.execute_async_script(
        """
        const scrape = async () => {
          const response = await fetch("https://selfservice.cedarville.edu/Student/Planning/DegreePlans/Current?studentId=""" + user_id + """");
          const data = await response.json();
          return data;
        };
        const callback = arguments[0];
        scrape().then(result => callback(result));
    """
    )

    body_content = json.dumps(
        {"studentId": f"{user_id}", "degreePlan": current_plan["DegreePlan"]}
    )

    student_eval = driver.execute_async_script(
        f"""
        const scrape = async () => {{
          const response = await fetch(
            "https://selfservice.cedarville.edu/Student/Planning/Programs/GetStudentProgramEvaluations",
            {{
              method: "POST",
              headers: {{
                "Content-Type": "application/json, charset=UTF-8",
              }},
              body: {body_content},
            }}
          );
          const data = await response.json();
          return data;
        }};
        const callback = arguments[0];
        scrape().then(result => callback(result));
    """
    )

    db = Prisma(auto_register=True)
    await db.connect()

    departments = await db.department.find_many()

    async with db.batch_() as batcher:
        majors = [major.name for major in (await db.major.find_many())]
        for major in student_eval["ActivePrograms"]:
            major_depts = major["Departments"]
            if len(major_depts) == 0 or len(major["Majors"]) == 0:
                continue
            major_name = (
                major["Description"] if major["Description"] else major["Majors"][0]
            )
            if major_name == "":
                continue
            major_dept = next(
                (dept for dept in departments if dept.code == major["Departments"][0]),
                None,
            )
            if major_dept is None:
                print(f"Department not found for major: {major_name}")
                continue
            major_degree = major["Code"].split(".")[0]
            if (
                next(
                    (
                        degree_type
                        for degree_type in DegreeType
                        if degree_type == major_degree
                    ),
                    None,
                )
                is None
            ):
                print(f"DegreeType not found for major: {major_name}")
                continue
            if majors.count(major_name) != 0:
                print(f"Major already exists: {major_name}")
                continue
            majors.append(major_name)
            print(f"Creating major: {major_name}")

            batcher.major.create(
                {
                    "name": major_name,
                    "type": major_degree,
                    "departmentId": major_dept.id,
                }
            )

    searchCriteria = {
        "keyword": None,
        "terms": [],
        "requirement": None,
        "subrequirement": None,
        "courseIds": None,
        "sectionIds": None,
        "requirementText": None,
        "subrequirementText": "",
        "group": None,
        "startTime": None,
        "endTime": None,
        "openSections": None,
        "subjects": [],
        "academicLevels": [],
        "courseLevels": [],
        "synonyms": [],
        "courseTypes": [],
        "topicCodes": [],
        "days": [],
        "locations": [],
        "faculty": [],
        "onlineCategories": None,
        "keywordComponents": [],
        "startDate": None,
        "endDate": None,
        "startsAtTime": None,
        "endsByTime": None,
        "pageNumber": 1,
        "sortOn": "None",
        "sortDirection": "Ascending",
        "subjectsBadge": [],
        "locationsBadge": [],
        "termFiltersBadge": [],
        "daysBadge": [],
        "facultyBadge": [],
        "academicLevelsBadge": [],
        "courseLevelsBadge": [],
        "courseTypesBadge": [],
        "topicCodesBadge": [],
        "onlineCategoriesBadge": [],
        "openSectionsBadge": "",
        "openAndWaitlistedSectionsBadge": "",
        "subRequirementText": None,
        "quantityPerPage": 500,
        "openAndWaitlistedSections": None,
        "searchResultsView": "CatalogListing",
    }

    post_search_data = []
    for page in range(4):
        searchCriteria["pageNumber"] = page + 1
        post_search_data.append(
            driver.execute_async_script(
                f"""
                const scrape = async () => {{
                  const response = await fetch(
                  "https://selfservice.cedarville.edu/Student/Student/Courses/PostSearchCriteria",
                    {{
                      method: "POST",
                      headers: {{
                        "Content-Type": "application/json, charset=UTF-8",
                      }},
                      body: '{json.dumps(searchCriteria)}',
                    }}
                  );
                  const data = await response.json();
                  return data;
                }};
                const callback = arguments[0];
                scrape().then(result => callback(result));
            """
            )
        )

    await db.requisite.delete_many()
    await db.course.delete_many()
    async with db.batch_() as batcher:
        for page in post_search_data:
            for course in page["CourseFullModels"]:
                seasonsOffered = None
                match (course["TermSessionCycle"]):
                    case "F":
                        seasonsOffered = SeasonsOffered.FALL_ONLY
                    case "S":
                        seasonsOffered = SeasonsOffered.SPRING_ONLY
                    case "SUM":
                        seasonsOffered = SeasonsOffered.SUMMER_ONLY
                    case "FS":
                        seasonsOffered = SeasonsOffered.FALL_SPRING
                    case "FSS":
                        seasonsOffered = SeasonsOffered.FALL_SPRING_SUMMER

                if seasonsOffered is None:
                    continue

                course_information = {
                    "title": course["Title"],
                    "description": course["Description"],
                    "credits": course["MinimumCredits"],
                    "offeredYears": (
                        OfferedYears.ALL_YEARS
                        if course["TermYearlyCycle"] == "A"
                        else (
                            OfferedYears.EVEN_YEARS
                            if course["TermYearlyCycle"] == "E"
                            else OfferedYears.ODD_YEARS
                        )
                    ),
                    "seasonsOffered": seasonsOffered,
                    "subject": course["SubjectCode"],
                    "code": course["Number"],
                }

                if course["MaximumCredits"] is not None:
                    course_information["maxCredits"] = course["MaximumCredits"]
                    course_information["stepCredits"] = course[
                        "VariableCreditIncrement"
                    ]

                batcher.course.create(course_information)

    async with db.batch_() as batcher:
        for page in post_search_data:
            for course in page["CourseFullModels"]:
                for requisite in course["CourseRequisites"]:
                    course_codes = re.findall(
                        r"[A-Z]{2,4}-\d{3,4}", requisite["DisplayText"]
                    )
                    is_prereq = (
                        RequisiteType.PREREQUISITE
                        if str(requisite["DisplayTextExtension"]).lower().find("prior")
                        != -1
                        else RequisiteType.CO_REQUISITE
                    )
                    for course_code in course_codes:
                        req_course = await db.course.find_first(
                            where={
                                "subject": course_code.split("-")[0],
                                "code": course_code.split("-")[1],
                            }
                        )
                        current_course = await db.course.find_first(
                            where={
                                "subject": course["SubjectCode"],
                                "code": course["Number"],
                            }
                        )
                        if req_course is None or current_course is None:
                            continue

                        print(
                            f"courseId: {current_course.id}, reqCourseId: {req_course.id}, type: {is_prereq}"
                        )
                        batcher.requisite.create(
                            {
                                "courseId": current_course.id,
                                "reqCourse": req_course.id,
                                "type": is_prereq,
                            }
                        )

    await db.disconnect()

    input("Press Enter to close the browser...")
    driver.quit()


if __name__ == "__main__":
    asyncio.run(main())
