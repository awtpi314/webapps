import asyncio
import json
import re
from unicodedata import category
import uuid

from cursesmenu import CursesMenu
from cursesmenu.items import MenuItem
from prisma import Prisma

major_translation = {
    "Bachelor of Science in Accounting": "Accounting",
    "Biblical Studies": "Biblical Studies",
    "Biology": "Biology (BA)",
    "BS-Biology": "Biology (BS)",
    "BA Broadcasting, Digital Media, and Journalism": "Broadcasting and Digital Media",
    "Chemistry": "Chemistry (BA)",
    "Bachelor of Science/Chemistry": "Chemistry (BS)",
    "Chemistry Education": "Chemistry Education",
    "Christian Education": "Christian Education",
    "Bachelor of Science in Civil Engineering": "Civil Engineering",
    "Bachelor of Arts in Communication": "Communication",
    "Computer Engineering": "Computer Engineering",
    "Computer Science": "Computer Science",
    "Criminal Justice": "Criminal Justice",
    "Cyber Operations": "Cyber Operations",
    "B.A. Economics": "Economics (BA)",
    "B.S. Economics": "Economics (BS)",
    "Elec Engineering": "Electrical Engineering",
    "Environmental Science": "Environmental Science",
    "Bachelor of Science in Finance": "Finance",
    "B.S. Forensic Science": "Forensic Science",
    "Geology": "Geology",
    "Visaul Communication Design": "Graphic Design",
    "History": "History",
    "Bachelor of Science: Information Technology Mmgt": "Information Technology Management",
    "Intercultural Studies - Missiology": "Intercultural Studies - Missiology",
    "International Studies": "International Studies",
    "Keyboard Pedagogy": "Keyboard Pedagogy",
    "Adolescent & Young Adult-Integrated Life Sciences": "Life Science Education",
    "Bachelor of Science: Management": "Management",
    "Marketing": "Marketing",
    "Mathematics": "Mathematics (BA)",
    "BS-Mathematics": "Mathematics (BS)",
    "Adolescent & Young Adults-Integrated Mathematics": "Mathematics Education - Integrated",
    "Mech Engineering": "Mechanical Engineering",
    "B.S. Molecular Biology": "Molecular Biology",
    "Music": "Music",
    "Multi-Age Music Education PreK-12": "Music Education",
    "Music Performance": "Performance",
    "BA Health and Physical Education-Multi-age": "Physical Education",
    "Political Science": "Political Science",
    "Prelaw": "Prelaw",
    "Psychology": "Psychology",
    "Adolescent & Young Adult-Integrated Sciences": "Science Comprehensive Education",
    "Adolescent & Young Adult-Integrated Social Studies": "Social Studies Education",
    "Bachelor of Science in Social Work": "Sociology",
    "Sport Business Management": "Sport Business Management",
    "Worship": "Worship",
}


async def create_plan_item(
    parent_id: str, parent_is_plan: bool, plan_item: dict, db: Prisma
) -> None:
    data = {
        "id": str(uuid.uuid4()),
        "name": plan_item["name"],
    }
    if parent_is_plan:
        data["planId"] = parent_id
    else:
        data["parentCategoryId"] = parent_id

    if plan_item["type"] == "course":
        await db.plancategory.create(data)
    elif plan_item["type"] == "group" and "children" in plan_item:
        if "required" in plan_item:
            data["count"] = plan_item["required"]
        elif "creditsneeded" in plan_item:
            data["credits"] = plan_item["creditsneeded"]

        new_category = await db.plancategory.create(data)
        for child in plan_item["children"]:
            await create_plan_item(
                new_category.id,
                False,
                child,
                db,
            )
    elif plan_item["type"] == "wildcard":
        name = plan_item["name"].split(" ")[0]
        data["name"] = name
        data["wildcard"] = f"{name.split("-")[0]}-{name.split("-")[1][0]}\\d{{3}}"
        await db.plancategory.create(data)


async def main() -> None:
    db = Prisma(auto_register=True)
    await db.connect()

    requirement_tree = json.loads(
        open(input("\033[2J\033[HEnter the JSON file path: ")).read()
    )["data"]["tree"]

    major = await db.major.find_first(where={"name": "Computer Science"})

    catalog = await db.catalog.find_first(where={"year":"2025"})

    student = await db.student.find_first()

    sample_plan = await db.plan.create(
        data={
            "id": str(uuid.uuid4()),
            "name": "Sample Plan",
            "catalogId": catalog.id,
            "studentId": student.id,
        }
    )
    await db.planmajors.create(
        data={
            "id": str(uuid.uuid4()),
            "planId": sample_plan.id,
            "majorId": major.id,
        }
    )

    for requirement in requirement_tree:
        await create_plan_item(
            sample_plan.id,
            True,
            requirement,
            db,
        )

    await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
