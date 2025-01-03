const TICKET_STATUS = {
  ACTIVE: 'true',
  INACTIVE: 'false',
  ALL: 'all',
};

const JOB_TYPE = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  INTERNSHIP: 'internship',
};

const TICKET_SORT_BY = {
  NEWEST_FIRST: 'newest',
  OLDEST_FIRST: 'oldest',
  ASCENDING: 'a-z',
  DESCENDING: 'z-a',
};
const CITY_TYPE = [
  "Buea", "Douala"
]

// module.exports = {
//   TICKET_STATUS,
//   TICKET_SORT_BY,
//   CITY_TYPE
// }
const MAILS_STATUS = [
  "active", "inactive"
]


const USER_ROLES_STATUS =
{
  ticketer: "ticket",
  mailer: "mail",
  admin: "admin",
  sub_admin: "sub_admin",
  restaurant_user: "restaurant",
  scanner: "scanner"

}
const USER_ROLES = [
  ...Object.values(USER_ROLES_STATUS)
]

module.exports = {
  USER_ROLES,
  USER_ROLES_STATUS,
  TICKET_STATUS,
  TICKET_SORT_BY,
  CITY_TYPE
}