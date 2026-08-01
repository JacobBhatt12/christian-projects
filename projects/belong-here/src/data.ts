export type Church = {
  id: string; name: string; denomination: string; city: string; address: string; distance: number
  image: string; services: string[]; description: string; beliefs: string; parking: string
  entrance: string; childcare: string; accessibility: string; tags: string[]
  welcome: { name: string; role: string; initials: string }; path: string[]; map: { x: number; y: number }
}

export type EventItem = {
  id: string; churchId: string; title: string; type: string; date: string; day: string; time: string
  location: string; image: string; description: string; childcare: boolean; accessible: boolean; spots?: number
}

export type Group = {
  id: string; churchId: string; name: string; stage: string; day: string; time: string; area: string
  format: string; childcare: boolean; accessible: boolean; hosts: string; description: string; image: string
}

export const churches: Church[] = [
  {
    id: 'harbor', name: 'Harbor City Church', denomination: 'Non-denominational', city: 'Raleigh, NC',
    address: '214 Linden Ave, Raleigh, NC 27601', distance: 2.4, image: '/images/community-friends.jpg',
    services: ['Sunday at 9:00 AM', 'Sunday at 10:45 AM'],
    description: 'A neighborhood church learning to follow Jesus and love Raleigh well.',
    beliefs: 'Jesus-centered teaching, historic Christian faith, and a generous welcome for questions.',
    parking: 'Free guest parking in the Linden Avenue lot. Look for the green welcome flags.',
    entrance: 'Use the glass doors under the cedar awning. A host can meet you outside.',
    childcare: 'Harbor Kids serves infants through 5th grade at both gatherings. Secure check-in opens 20 minutes early.',
    accessibility: 'Step-free entrance, reserved parking, hearing loop, large-print guides, and a low-sensory room.',
    tags: ['Kids', 'Young adults', 'Accessibility', 'Community care'],
    welcome: { name: 'Sarah Kim', role: 'Newcomer care lead', initials: 'SK' },
    path: ['Plan your first visit', 'Meet Sarah at the welcome table', 'Try Starting Point over lunch'], map: { x: 48, y: 38 },
  },
  {
    id: 'grace', name: 'Grace Commons', denomination: 'United Methodist', city: 'Durham, NC',
    address: '801 W Chapel Hill St, Durham, NC 27701', distance: 8.1, image: '/images/community-meal.jpg',
    services: ['Sunday at 8:30 AM', 'Sunday at 11:00 AM'],
    description: 'Liturgical worship, thoughtful teaching, and a strong commitment to serving neighbors.',
    beliefs: 'A Wesleyan community shaped by grace, Scripture, prayer, and practical care for the city.',
    parking: 'Street parking is free Sundays. The Morgan Street deck is validated at the welcome desk.',
    entrance: 'The accessible main entrance faces Morgan Street beside the courtyard.',
    childcare: 'Nursery through age 4 is available at 11:00 AM. Children are welcome in every service.',
    accessibility: 'Elevator access, ASL interpretation twice monthly, wheelchair seating, and fragrance-aware seating.',
    tags: ['Traditional worship', 'Local service', 'Seniors', 'ASL'],
    welcome: { name: 'Elena Brooks', role: 'Pastor of hospitality', initials: 'EB' },
    path: ['Sunday welcome coffee', 'Meet Pastor Elena', 'Explore a neighborhood table'], map: { x: 22, y: 26 },
  },
  {
    id: 'table', name: 'The Table Church', denomination: 'Anglican', city: 'Cary, NC',
    address: '105 Academy Street, Cary, NC 27511', distance: 9.6, image: '/images/community-table.jpg',
    services: ['Sunday at 10:00 AM', 'Wednesday prayers at 6:30 PM'],
    description: 'A relaxed, sacramental community gathering around worship, meals, and shared life.',
    beliefs: 'Rooted in Scripture and the ancient church, with room for reflection, doubt, and discovery.',
    parking: 'Use the public library lot across Academy Street. Accessible spaces are beside the chapel.',
    entrance: 'Enter through the blue courtyard gate. Sanctuary doors stay open until the service begins.',
    childcare: 'A staffed nursery and children’s formation are available Sundays after the opening songs.',
    accessibility: 'Step-free throughout, printed liturgy, quiet seating, and gluten-free communion bread.',
    tags: ['Liturgy', 'Shared meals', 'Artists', 'Quiet space'],
    welcome: { name: 'Marcus Reed', role: 'Welcome Table host', initials: 'MR' },
    path: ['Share Sunday lunch', 'Join the three-week Welcome Table', 'Choose a parish circle'], map: { x: 65, y: 66 },
  },
  {
    id: 'newhope', name: 'New Hope Fellowship', denomination: 'Baptist', city: 'Chapel Hill, NC',
    address: '440 Franklin Road, Chapel Hill, NC 27516', distance: 13.2, image: '/images/worship.jpg',
    services: ['Sunday at 9:30 AM', 'Sunday at 11:30 AM'],
    description: 'Joyful worship, practical Bible teaching, and a multigenerational church family.',
    beliefs: 'Evangelical Baptist faith with an emphasis on discipleship, mission, and life together.',
    parking: 'Large on-site lot with a first-time guest lane near the main entrance.',
    entrance: 'Follow the orange guest signs to Entrance B. The lobby opens 30 minutes early.',
    childcare: 'Full children’s programming from 6 weeks through 5th grade at both services.',
    accessibility: 'Accessible seating, captioned messages, sensory kits, and companion restrooms.',
    tags: ['Students', 'Families', 'Gospel music', 'Bible studies'],
    welcome: { name: 'Jamal Carter', role: 'Connections director', initials: 'JC' },
    path: ['Visit the guest lounge', 'Attend Next Steps Sunday', 'Meet a ministry guide'], map: { x: 13, y: 59 },
  },
  {
    id: 'riverstone', name: 'Riverstone Community', denomination: 'Presbyterian (EPC)', city: 'Wake Forest, NC',
    address: '72 Magnolia Ridge, Wake Forest, NC 27587', distance: 15.7, image: '/images/family.jpg',
    services: ['Sunday at 8:45 AM', 'Sunday at 10:15 AM'],
    description: 'A calm, family-friendly community centered on Scripture, friendship, and care.',
    beliefs: 'Reformed Christian tradition, intergenerational worship, and everyday formation.',
    parking: 'On-site parking includes a shaded family drop-off and 12 accessible spaces.',
    entrance: 'The main entrance faces the playground. Greeters wear navy name badges.',
    childcare: 'Nursery is available all morning. Preschool and elementary groups meet at 10:15 AM.',
    accessibility: 'Single-level campus, hearing assistance, large-print materials, and mobility escorts.',
    tags: ['Families', 'Home groups', 'Care ministry', 'Seniors'],
    welcome: { name: 'Anne Wallace', role: 'Community life coordinator', initials: 'AW' },
    path: ['Schedule a hosted visit', 'Join Pizza with the Pastors', 'Find a home gathering'], map: { x: 79, y: 16 },
  },
]

export const events: EventItem[] = [
  { id: 'welcome-lunch', churchId: 'harbor', title: 'Welcome Lunch', type: 'Newcomers', date: 'AUG 09', day: 'Sunday', time: '12:15 PM', location: 'Harbor Room', image: '/images/community-meal.jpg', description: 'A relaxed one-hour lunch with staff and other newer people. Bring your questions. Lunch is provided.', childcare: true, accessible: true, spots: 18 },
  { id: 'serve-saturday', churchId: 'harbor', title: 'Serve Raleigh Saturday', type: 'Volunteer', date: 'AUG 15', day: 'Saturday', time: '9:00 AM', location: 'Oakwood Community Garden', image: '/images/volunteer.jpg', description: 'Work alongside a small team at the community garden. No experience needed and tools are provided.', childcare: false, accessible: true, spots: 11 },
  { id: 'park-picnic', churchId: 'harbor', title: 'Young Adult Park Picnic', type: 'Community', date: 'AUG 20', day: 'Thursday', time: '6:30 PM', location: 'Dorothea Dix Park', image: '/images/young-adults.jpg', description: 'A low-key picnic for people in their 20s and 30s. Come for ten minutes or stay all evening.', childcare: false, accessible: true },
  { id: 'grace-coffee', churchId: 'grace', title: 'Coffee with Grace', type: 'Newcomers', date: 'AUG 16', day: 'Sunday', time: '10:00 AM', location: 'Grace Courtyard', image: '/images/community-friends.jpg', description: 'Meet two church members between services and take an optional building tour.', childcare: true, accessible: true },
  { id: 'table-supper', churchId: 'table', title: 'Neighborhood Supper', type: 'Meal', date: 'AUG 12', day: 'Wednesday', time: '6:00 PM', location: 'Parish Courtyard', image: '/images/community-table.jpg', description: 'A shared outdoor meal with vegetarian and gluten-free options. Children are welcome.', childcare: false, accessible: true, spots: 24 },
  { id: 'student-night', churchId: 'newhope', title: 'Student Welcome Night', type: 'Students', date: 'AUG 14', day: 'Friday', time: '7:00 PM', location: 'Student Center', image: '/images/students.jpg', description: 'Games, dinner, and small-group introductions for middle and high school students.', childcare: false, accessible: true },
  { id: 'pizza-pastors', churchId: 'riverstone', title: 'Pizza with the Pastors', type: 'Newcomers', date: 'AUG 23', day: 'Sunday', time: '11:45 AM', location: 'Magnolia Hall', image: '/images/community-meal.jpg', description: 'Hear Riverstone’s story and meet the pastors over a casual family lunch.', childcare: true, accessible: true, spots: 16 },
]

export const groups: Group[] = [
  { id: 'midtown', churchId: 'harbor', name: 'Midtown Table', stage: 'Mixed ages', day: 'Tuesday', time: '7:00 PM', area: 'Five Points', format: 'In person', childcare: true, accessible: true, hosts: 'Maya & Theo', description: 'Dinner, Scripture, and honest conversation for people in a mix of seasons.', image: '/images/community-meal.jpg' },
  { id: 'twenty-thirty', churchId: 'harbor', name: 'Twenty & Thirty', stage: 'Young adults', day: 'Thursday', time: '6:30 PM', area: 'Downtown', format: 'In person', childcare: false, accessible: true, hosts: 'Jordan & Nia', description: 'A welcoming group for work, friendship, faith, and everything in between.', image: '/images/young-adults.jpg' },
  { id: 'parents', churchId: 'harbor', name: 'Parents Circle', stage: 'Parents', day: 'Sunday', time: '4:30 PM', area: 'North Hills', format: 'Hybrid', childcare: true, accessible: true, hosts: 'Priya & Ben', description: 'A low-prep gathering for parents of young children. Dinner and childcare are shared.', image: '/images/family.jpg' },
  { id: 'west-end', churchId: 'grace', name: 'West End Neighbors', stage: 'Mixed ages', day: 'Wednesday', time: '6:00 PM', area: 'West End', format: 'In person', childcare: true, accessible: true, hosts: 'The Robinsons', description: 'A neighborhood meal and guided conversation hosted in an accessible home.', image: '/images/community-friends.jpg' },
  { id: 'artists', churchId: 'table', name: 'Artists & Prayer', stage: 'Adults', day: 'Monday', time: '7:30 PM', area: 'Cary Arts District', format: 'In person', childcare: false, accessible: false, hosts: 'Lena & Chris', description: 'A reflective circle for working artists, makers, and the creatively curious.', image: '/images/community-table.jpg' },
  { id: 'campus', churchId: 'newhope', name: 'Campus Bible Study', stage: 'College', day: 'Thursday', time: '8:00 PM', area: 'UNC Campus', format: 'In person', childcare: false, accessible: true, hosts: 'Avery & Micah', description: 'Open discussion and a short Bible study for undergrad and graduate students.', image: '/images/students.jpg' },
]

export const interests = ['Small groups', 'Upcoming events', 'Serving', 'Bible studies', 'Young adults', 'Student ministry', 'Newcomer gatherings', 'Prayer support']