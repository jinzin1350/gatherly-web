export type UIStyle = 'elegant' | 'playful' | 'minimal' | 'bold' | 'romantic';

export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
};

export type ScheduleItem = {
  time: string;
  title: string;
  description: string;
};

export type EventImages = {
  hero: string;
  details: string;
  rsvp: string;
  timeline: string[];
};

export type EventData = {
  eventId: string;
  shortToken: string;
  hostId: string;
  title: string;
  description: string;
  themeName: string;
  themeColors: ThemeColors;
  uiStyle: UIStyle;
  isRTL: boolean;
  date: string;
  time: string;
  location: string;
  schedule: ScheduleItem[];
  vibe: string;
  welcomeMessage: string;
  images: EventImages;
  plan: 'free' | 'party' | 'unlimited';
  createdAt: string;
};

export type Guest = {
  guestId: string;
  eventId: string;
  name: string;
  email: string;
  attending: boolean;
  bringing?: string;
  rsvpAt: string;
};

export type PromptAnalysis = {
  needsMoreInfo: boolean;
  missingFields: { date: boolean; time: boolean; location: boolean };
  extractedData: { date: string; time: string; location: string };
};

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };
