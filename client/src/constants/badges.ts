export interface BaseBadge {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
}

export const BASE_BADGES: BaseBadge[] = [
  {
    badgeId: 'correct-answers-1',
    name: 'First Correct Answer',
    description: 'Answered your first question correctly',
    icon: 'https://res.cloudinary.com/dyovx6ydl/image/upload/v1763443645/day1_etmz9b.png',
  },
  {
    badgeId: 'correct-answers-5',
    name: 'Quick Learner',
    description: 'Answered 5 questions correctly',
    icon: 'https://res.cloudinary.com/dyovx6ydl/image/upload/v1763443645/day5_cajgox.png',
  },
  {
    badgeId: 'correct-answers-10',
    name: 'Getting Started',
    description: 'Answered 10 questions correctly',
    icon: 'https://res.cloudinary.com/dyovx6ydl/image/upload/v1763443645/day10_hiibwo.png',
  },
  {
    badgeId: 'correct-answers-25',
    name: 'Knowledge Seeker',
    description: 'Answered 25 questions correctly',
    icon: 'https://res.cloudinary.com/dyovx6ydl/image/upload/v1763443645/day25_rrjydh.png',
  },
  {
    badgeId: 'correct-answers-50',
    name: 'Quiz Master',
    description: 'Answered 50 questions correctly',
    icon: 'https://res.cloudinary.com/dyovx6ydl/image/upload/v1763443645/day50_olyn7n.png',
  },
  {
    badgeId: 'correct-answers-100',
    name: 'Quiz Legend',
    description: 'Answered 100 questions correctly',
    icon: 'https://res.cloudinary.com/dyovx6ydl/image/upload/v1763443645/day100_opojgy.png',
  },
  {
    badgeId: 'correct-answers-500',
    name: 'Grandmaster',
    description: 'Answered 500 questions correctly',
    icon: 'https://res.cloudinary.com/dyovx6ydl/image/upload/v1763483453/day500_dhmccv.png',
  },
];


