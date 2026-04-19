import type { EventData, PromptAnalysis } from './types';

const PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSI5MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2U4ZTBkNSIvPjwvc3ZnPg==';

export const FIXTURE_EVENT: EventData = {
  eventId: 'test',
  shortToken: 'abc1234567',
  hostId: 'anon',
  title: "Sophia's Princess Birthday",
  description:
    "A magical afternoon filled with tiaras, fairy tales, and the sweetest five-year-old you've ever met. Come dressed to impress — crowns welcome.",
  themeName: 'Royal Princess',
  themeColors: {
    primary: '#C9A96E',
    secondary: '#F5E6D3',
    background: '#FFFAF5',
    text: '#3D2B1F',
  },
  uiStyle: 'elegant',
  isRTL: false,
  date: 'Saturday, October 24th, 2026',
  time: '3:00 PM – 6:00 PM',
  location: 'The Royal Gardens, 456 Emerald Ave, Toronto, ON',
  schedule: [
    {
      time: '3:00 PM',
      title: 'Royal Arrival',
      description:
        'Guests arrive and are greeted with sparkling lemonade and a flower crown station.',
    },
    {
      time: '3:30 PM',
      title: 'The Grand Cake Ceremony',
      description:
        'Five candles, one wish, and a whole lot of singing. The moment everyone came for.',
    },
    {
      time: '4:15 PM',
      title: 'Princess Games & Dance',
      description:
        'Musical thrones, freeze dancing, and a royal parade around the garden.',
    },
    {
      time: '5:30 PM',
      title: 'Farewell & Goody Bags',
      description:
        'Every guest leaves with a little box of magic — thank you for celebrating with us!',
    },
  ],
  vibe: 'soft pink gold princess fairy tale',
  welcomeMessage:
    'You are cordially invited to the most enchanting afternoon of the year.',
  images: {
    hero: PLACEHOLDER,
    details: PLACEHOLDER,
    rsvp: PLACEHOLDER,
    timeline: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
  },
  plan: 'free',
  createdAt: new Date().toISOString(),
};

export const FIXTURE_ANALYSIS: PromptAnalysis = {
  needsMoreInfo: false,
  missingFields: { date: false, time: false, location: false },
  extractedData: {
    date: 'Saturday, October 24th, 2026',
    time: '3:00 PM – 6:00 PM',
    location: 'The Royal Gardens, 456 Emerald Ave',
  },
};
