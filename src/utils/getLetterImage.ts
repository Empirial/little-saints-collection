// Dynamically import all personalization images
const images = import.meta.glob<{ default: string }>(
  '/src/assets/personalizationjpg/**/*.{webp,jpg}',
  { eager: true }
);

type Gender = 'boy' | 'girl';
type SkinTone = 'light' | 'dark';
type Theme = 'superhero' | 'fairytale' | 'animal';

// Map gender + skinTone to folder name
const getCharacterFolder = (gender: Gender, skinTone: SkinTone): string => {
  if (gender === 'boy') {
    return skinTone === 'dark' ? 'Blackboy' : 'whiteboy';
  }
  return skinTone === 'dark' ? 'Blackgirl' : 'whitegirl';
};

// Map theme to folder name
const getThemeFolder = (theme: Theme): string => {
  switch (theme) {
    case 'superhero':
      return 'Superherotheme';
    case 'fairytale':
      return 'Fairytaletheme';
    case 'animal':
      return 'Wildanimaltheme';
    default:
      return 'Superherotheme';
  }
};

// Convert letter to number (A=1, B=2, ... Z=26)
const letterToNumber = (letter: string): number => {
  const upper = letter.toUpperCase();
  return upper.charCodeAt(0) - 64; // A is 65 in ASCII
};

export const getLetterImage = (
  gender: Gender,
  skinTone: SkinTone,
  theme: Theme,
  letter: string
): string | undefined => {
  const characterFolder = getCharacterFolder(gender, skinTone);
  const themeFolder = getThemeFolder(theme);
  const letterNum = letterToNumber(letter);

  // Try both .webp and .jpg extensions
  const extensions = ['webp', 'jpg'];
  
  for (const ext of extensions) {
    const path = `/src/assets/personalizationjpg/${characterFolder}/${themeFolder}/${letterNum}.${ext}`;
    if (images[path]) {
      return images[path].default;
    }
  }

  return undefined;
};

export default getLetterImage;
