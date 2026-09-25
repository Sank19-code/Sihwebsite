/**
 * Narration languages for the story section.
 *
 * `speech` is the BCP-47 tag handed to the Web Speech API. Whether a voice is
 * actually installed depends on the operating system — the StorySection checks
 * `speechSynthesis.getVoices()` and says so in the UI when one is missing,
 * rather than silently doing nothing.
 *
 * Story bodies are authored in English for the prototype. The selector changes
 * the narration voice and the UI chrome; a production build would carry a
 * translated body per language, written by a human translator.
 */
export interface Language {
  code: string;
  label: string;
  speech: string;
  ui: {
    play: string;
    pause: string;
    chapter: string;
    narration: string;
  };
}

export const languages: Language[] = [
  {
    code: 'en',
    label: 'English',
    speech: 'en-IN',
    ui: { play: 'Play', pause: 'Pause', chapter: 'Chapter', narration: 'Narration' },
  },
  {
    code: 'hi',
    label: 'हिन्दी',
    speech: 'hi-IN',
    ui: { play: 'सुनें', pause: 'रोकें', chapter: 'अध्याय', narration: 'कथावाचन' },
  },
  {
    code: 'ta',
    label: 'தமிழ்',
    speech: 'ta-IN',
    ui: { play: 'கேட்க', pause: 'நிறுத்து', chapter: 'அத்தியாயம்', narration: 'விவரிப்பு' },
  },
  {
    code: 'ml',
    label: 'മലയാളം',
    speech: 'ml-IN',
    ui: { play: 'കേൾക്കുക', pause: 'നിർത്തുക', chapter: 'അധ്യായം', narration: 'ആഖ്യാനം' },
  },
  {
    code: 'te',
    label: 'తెలుగు',
    speech: 'te-IN',
    ui: { play: 'వినండి', pause: 'ఆపు', chapter: 'అధ్యాయం', narration: 'కథనం' },
  },
];

export const languageByCode = (code: string) => languages.find((l) => l.code === code) ?? languages[0];
