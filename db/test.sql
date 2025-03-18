select
  semester.year as year,
  semester.season as season
from semester
  join semester_to_course on semester.id = semester_to_course.semester_id
  join course on semester_to_course.course_id = course.id
where semester.plan_id = 10;