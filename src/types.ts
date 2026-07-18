export type WriterId = 'poe' | 'pizarnik' | 'benedetti' | 'dickinson' | 'cortazar' | 'becquer' | 'neruda';

export interface Letter {
  id: WriterId;
  author: string;
  styleName: string;
  envelopeBg: string; // Tailwind class or hex
  sealBg: string; // Tailwind class or hex
  sealSymbol: string; // e.g., '🪶', '🥀', '☕', '🌸', '🦎', '🌟', '⛵'
  sealColor: string; // for wax aesthetic
  title: string;
  quote: string;
  poem: string[];
  reflection: string;
  dedication: string;
  textColor: string; // custom writing color (e.g. sepia, dark charcoal)
  paperBg: string; // vintage paper theme
}

export type AppStage = 'landing' | 'closed-box' | 'opened-box' | 'finale' | 'final-letter' | 'ended';
