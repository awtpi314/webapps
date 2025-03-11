drop table if exists plan_to_course;
drop table if exists minor_to_plan;
drop table if exists major_to_plan;
drop table if exists minor_requirements;
drop table if exists major_requirements;
drop table if exists plans;
drop table if exists course;
drop table if exists minor;
drop table if exists major;
drop table if exists department;
drop table if exists user;
drop table if exists catalog;
drop table if exists semester_to_course;
drop table if exists semester;
create table catalog (
  id int auto_increment,
  year int,
  primary key (id)
);
create table user (
  id int auto_increment,
  name varchar(40),
  email varchar(40),
  password varchar(40),
  primary key (id)
);
create table department (
  id int auto_increment,
  name varchar(40),
  primary key (id)
);
create table major (
  id int auto_increment,
  name varchar(40),
  dept_id int,
  num_credits float check (num_credits >= 0),
  primary key (id),
  foreign key (dept_id) references department(id) on update cascade on delete cascade
);
create table minor (
  id int auto_increment,
  name varchar(40),
  dept_id int,
  primary key (id),
  foreign key (dept_id) references department(id) on update cascade on delete cascade
);
create table course (
  id int auto_increment,
  title varchar(40),
  decription varchar(60),
  credits float check (credits >= 0),
  primary key (id)
);
create table plans (
  id int auto_increment,
  user_id int,
  catalog_id int,
  name varchar(40),
  primary key (id),
  foreign key (user_id) references user(id) on update cascade on delete cascade,
  foreign key (catalog_id) references catalog(id) on update cascade on delete cascade
);
create table major_requirements (
  id int auto_increment,
  elective boolean,
  major_id int,
  course_id int,
  primary key (id),
  foreign key (major_id) references major(id) on update cascade on delete cascade,
  foreign key (course_id) references course(id) on update cascade on delete cascade
);
create table minor_requirements (
  id int auto_increment,
  elective boolean,
  minor_id int,
  course_id int,
  primary key (id),
  foreign key (minor_id) references minor(id) on update cascade on delete cascade,
  foreign key (course_id) references course(id) on update cascade on delete cascade
);
create table major_to_plan (
  major_id int,
  plan_id int,
  primary key (major_id, plan_id),
  foreign key (major_id) references major(id) on update cascade on delete cascade,
  foreign key (plan_id) references plans(id) on update cascade on delete cascade
);
create table minor_to_plan (
  minor_id int,
  plan_id int,
  primary key (minor_id, plan_id),
  foreign key (minor_id) references minor(id) on update cascade on delete cascade,
  foreign key (plan_id) references plans(id) on update cascade on delete cascade
);
create table semester (
  id int auto_increment,
  plan_id int,
  year int,
  season varchar(40),
  primary key (id),
  foreign key (plan_id) references plans(id) on update cascade on delete cascade
);
create table semester_to_course (
  id int auto_increment,
  semester_id int,
  course_id int,
  primary key (id),
  foreign key (semester_id) references semester(id) on update cascade on delete cascade,
  foreign key (course_id) references course(id) on update cascade on delete cascade
);