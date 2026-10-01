export interface LiveCommenter {
  name: string;
  avatar: string;
  text: string;
}

export interface LiveOffering {
  n: string;     // Name
  uf: string;    // City / State
  v: number;     // Value in USD ($)
  m: number;     // Minutes ago
  av: string;    // Avatar URL
}

// 36 American users with authentic avatars and realistic faith comments for the Facebook Live Chat
export const LIVE_COMMENTS: LiveCommenter[] = [
  {
    name: "Mary Johnson",
    avatar: "https://randomuser.me/api/portraits/women/71.jpg",
    text: "I'm in tears here in my living room... this is exactly what I prayed for on my knees this morning! 😭🙏"
  },
  {
    name: "Charles Anderson",
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    text: "Just gave with so much faith. An indescribable peace just came over my heart."
  },
  {
    name: "Lucy Ferreira",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    text: "My faith was completely renewed after hearing every single one of these words."
  },
  {
    name: "Mark Preston",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    text: "Just gave $50. God knows how much my family needed this deliverance."
  },
  {
    name: "Frances Chambers",
    avatar: "https://randomuser.me/api/portraits/women/75.jpg",
    text: "Glory to God in the highest! I feel the presence of the Holy Spirit here in my room right now."
  },
  {
    name: "Joseph Gilmore",
    avatar: "https://randomuser.me/api/portraits/men/52.jpg",
    text: "Just gave online, I'm not missing my place in this blessing for anything!"
  },
  {
    name: "Anna Albright",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "I'm not leaving this live until I honor what He asked of my heart."
  },
  {
    name: "Sebastian Peters",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "It was a message just like this that saved my sister's life and marriage last year."
  },
  {
    name: "Claire Souza",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    text: "I needed this urgent miracle so badly for my home and my kids."
  },
  {
    name: "Roger Silvers",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    text: "God is alive and real! Just gave $35 with all my heart."
  },
  {
    name: "Nancy Martins",
    avatar: "https://randomuser.me/api/portraits/women/21.jpg",
    text: "Everyone, don't leave the live! The most important part of the revelation is coming now."
  },
  {
    name: "Walter Reeves",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    text: "Every person of faith needs to hear this message urgently."
  },
  {
    name: "Bernadette Silva",
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    text: "Amen, Lord! I receive and take hold of this victory in my financial life."
  },
  {
    name: "John Almeida",
    avatar: "https://randomuser.me/api/portraits/men/36.jpg",
    text: "Just shared this in my whole family's prayer group."
  },
  {
    name: "Sylvia Castro",
    avatar: "https://randomuser.me/api/portraits/women/9.jpg",
    text: "I'd been asking God for a sign since 3 in the morning... and that sign just arrived!"
  },
  {
    name: "Claude Dias",
    avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    text: "Tears running down my face... thank you so much, Lord Jesus. Just gave $50."
  },
  {
    name: "Rose Vaughn",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    text: "I'm so grateful I clicked and waited for this door to open."
  },
  {
    name: "Daniel Fagan",
    avatar: "https://randomuser.me/api/portraits/men/60.jpg",
    text: "My family is going to witness this miracle this very week, in Jesus' name."
  },
  {
    name: "Darlene Hunter",
    avatar: "https://randomuser.me/api/portraits/women/50.jpg",
    text: "It had been months since I felt hope this alive in my chest."
  },
  {
    name: "Matthew Barber",
    avatar: "https://randomuser.me/api/portraits/men/70.jpg",
    text: "Decided to choose faith over fear. Just gave $50 right now."
  },
  {
    name: "Kristina Combs",
    avatar: "https://randomuser.me/api/portraits/women/79.jpg",
    text: "This video found me at the hardest moment of my walk."
  },
  {
    name: "Sergio Correia",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    text: "I'm ready to take this step of faith. Just gave $70."
  },
  {
    name: "Regina Cole",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    text: "Praying with all my heart for every brother and sister watching this live ❤️"
  },
  {
    name: "Anthony Carlson",
    avatar: "https://randomuser.me/api/portraits/men/83.jpg",
    text: "Keep watching until the very last minute, every detail is worth it."
  },
  {
    name: "Helen Toledo",
    avatar: "https://randomuser.me/api/portraits/women/8.jpg",
    text: "I almost closed my phone... what a huge blessing it was to stay here."
  },
  {
    name: "Marcus Teixeira",
    avatar: "https://randomuser.me/api/portraits/men/15.jpg",
    text: "This is the answer to prayer I'd been looking for over 6 months."
  },
  {
    name: "Shirley Miranda",
    avatar: "https://randomuser.me/api/portraits/women/24.jpg",
    text: "My heart calmed down in a way no medicine ever could."
  },
  {
    name: "Paul Bragg",
    avatar: "https://randomuser.me/api/portraits/men/18.jpg",
    text: "Just gave with unshakable faith. God honors those who trust Him."
  },
  {
    name: "Michelle Cavanaugh",
    avatar: "https://randomuser.me/api/portraits/women/26.jpg",
    text: "I can already feel something shifting spiritually in my court case."
  },
  {
    name: "Kyle Oliver",
    avatar: "https://randomuser.me/api/portraits/men/25.jpg",
    text: "You can't ignore a calling this clear."
  },
  {
    name: "Laura Pierce",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    text: "It touched the bottom of my wound, but it brought instant healing."
  },
  {
    name: "Brendan Evans",
    avatar: "https://randomuser.me/api/portraits/men/28.jpg",
    text: "Just gave $20. Taking hold of my blessing today!"
  },
  {
    name: "Yvonne Teller",
    avatar: "https://randomuser.me/api/portraits/women/71.jpg",
    text: "Tears of pure gratitude running down my face right now."
  },
  {
    name: "Jefferson Paul",
    avatar: "https://randomuser.me/api/portraits/men/29.jpg",
    text: "I called my wife over to watch with me, we're both so moved."
  },
  {
    name: "Eunice Caldwell",
    avatar: "https://randomuser.me/api/portraits/women/36.jpg",
    text: "I've never felt this welcomed and heard by God before."
  },
  {
    name: "Harold Santana",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
    text: "This is definitely not a coincidence. God is the one who guided me here."
  }
];

// American recent offerings (recent gifts in $: 20, 35, 50, 70, 150)
export const LIVE_OFFERINGS: LiveOffering[] = [
  { n: "Faith R.",        uf: "Columbus, OH",       v: 50,  m: 1,  av: "https://randomuser.me/api/portraits/women/71.jpg" },
  { n: "Charles E.",      uf: "Phoenix, AZ",        v: 35,  m: 2,  av: "https://randomuser.me/api/portraits/men/42.jpg" },
  { n: "Patricia W.",     uf: "Austin, TX",         v: 50,  m: 3,  av: "https://randomuser.me/api/portraits/women/68.jpg" },
  { n: "Marcus B.",       uf: "Charlotte, NC",      v: 20,  m: 4,  av: "https://randomuser.me/api/portraits/men/45.jpg" },
  { n: "Barbara M.",      uf: "Orlando, FL",        v: 150, m: 6,  av: "https://randomuser.me/api/portraits/women/75.jpg" },
  { n: "Walter D.",       uf: "Sacramento, CA",     v: 70,  m: 7,  av: "https://randomuser.me/api/portraits/men/52.jpg" },
  { n: "Shirley C.",      uf: "Nashville, TN",      v: 50,  m: 9,  av: "https://randomuser.me/api/portraits/women/44.jpg" },
  { n: "James W.",        uf: "Kansas City, MO",    v: 35,  m: 11, av: "https://randomuser.me/api/portraits/men/32.jpg" },
  { n: "Katie H.",        uf: "Pittsburgh, PA",     v: 20,  m: 12, av: "https://randomuser.me/api/portraits/women/33.jpg" },
  { n: "David M.",        uf: "Denver, CO",         v: 150, m: 14, av: "https://randomuser.me/api/portraits/men/11.jpg" },
  { n: "Nancy M.",        uf: "Portland, OR",       v: 50,  m: 16, av: "https://randomuser.me/api/portraits/women/21.jpg" },
  { n: "Richard T.",      uf: "Memphis, TN",        v: 70,  m: 18, av: "https://randomuser.me/api/portraits/men/22.jpg" },
  { n: "Betty R.",        uf: "Tulsa, OK",          v: 50,  m: 19, av: "https://randomuser.me/api/portraits/women/17.jpg" },
  { n: "John A.",         uf: "Wichita, KS",        v: 20,  m: 21, av: "https://randomuser.me/api/portraits/men/36.jpg" },
  { n: "Sandra L.",       uf: "Tampa, FL",          v: 150, m: 23, av: "https://randomuser.me/api/portraits/women/9.jpg" },
  { n: "Margaret F.",     uf: "Richmond, VA",       v: 35,  m: 25, av: "https://randomuser.me/api/portraits/women/71.jpg" },
  { n: "Claude T.",       uf: "Raleigh, NC",        v: 50,  m: 27, av: "https://randomuser.me/api/portraits/men/41.jpg" },
  { n: "Carla W.",        uf: "Baton Rouge, LA",    v: 50,  m: 29, av: "https://randomuser.me/api/portraits/women/12.jpg" },
  { n: "Daniel J.",       uf: "Fresno, CA",         v: 70,  m: 32, av: "https://randomuser.me/api/portraits/men/60.jpg" },
  { n: "Dorothy K.",      uf: "Birmingham, AL",     v: 50,  m: 34, av: "https://randomuser.me/api/portraits/women/50.jpg" },
  { n: "Matthew M.",      uf: "Omaha, NE",          v: 20,  m: 37, av: "https://randomuser.me/api/portraits/men/70.jpg" },
  { n: "Angela S.",       uf: "Des Moines, IA",     v: 35,  m: 39, av: "https://randomuser.me/api/portraits/women/79.jpg" },
  { n: "Steven L.",       uf: "Little Rock, AR",    v: 50,  m: 42, av: "https://randomuser.me/api/portraits/men/75.jpg" },
  { n: "Rebecca M.",      uf: "Jacksonville, FL",   v: 50,  m: 45, av: "https://randomuser.me/api/portraits/women/90.jpg" },
  { n: "Anthony R.",      uf: "Louisville, KY",     v: 70,  m: 48, av: "https://randomuser.me/api/portraits/men/83.jpg" },
  { n: "Helen A.",        uf: "Cincinnati, OH",     v: 150, m: 51, av: "https://randomuser.me/api/portraits/women/8.jpg" },
  { n: "Mark T.",         uf: "Greenville, SC",     v: 20,  m: 54, av: "https://randomuser.me/api/portraits/men/15.jpg" },
  { n: "Ursula B.",       uf: "Spokane, WA",        v: 50,  m: 58, av: "https://randomuser.me/api/portraits/women/23.jpg" },
  { n: "Sharon B.",       uf: "Boise, ID",          v: 50,  m: 63, av: "https://randomuser.me/api/portraits/women/24.jpg" },
  { n: "Paul G.",         uf: "Albuquerque, NM",    v: 35,  m: 69, av: "https://randomuser.me/api/portraits/men/18.jpg" },
  { n: "Michelle C.",     uf: "Knoxville, TN",      v: 70,  m: 74, av: "https://randomuser.me/api/portraits/women/26.jpg" },
  { n: "Kevin R.",        uf: "Madison, WI",        v: 50,  m: 81, av: "https://randomuser.me/api/portraits/men/25.jpg" }
];
