/**
 * Sanitizes text to be 100% compatible with standard PDF fonts (WinAnsi / Latin-1)
 * Strips unsupported emojis and converts typographic unicode punctuation to safe equivalents.
 */
export function sanitizePdfText(input: string | undefined | null): string {
  if (!input) return '';

  return input
    // Normalize unicode NFC
    .normalize('NFC')
    // Remove emojis, symbols, and pictographs
    .replace(/\p{Extended_Pictographic}/gu, '')
    // Remove emoji modifier sequences and variation selectors
    .replace(/\p{Emoji_Modifier}/gu, '')
    .replace(/[\uFE00-\uFE0F]/gu, '')
    // Replace smart single quotes
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    // Replace smart double quotes
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036\u00AB\u00BB]/g, '"')
    // Replace em/en dashes and minus signs
    .replace(/[\u2013\u2014\u2015\u2212]/g, '-')
    // Replace ellipsis
    .replace(/\u2026/g, '...')
    // Replace non-breaking spaces
    .replace(/[\u00A0\u2007\u202F]/g, ' ')
    // Replace zero-width spaces / joiners
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Replace bullet symbols with standard bullet
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '•')
    // Trim extra spaces
    .replace(/ +/g, ' ')
    .trim();
}
