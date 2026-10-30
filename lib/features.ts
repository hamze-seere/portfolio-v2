/*
  On/off switches for the optional effects. Set any of these to `false` and
  rebuild — that effect disappears completely and the site works exactly as
  before. All of them already switch themselves off for visitors who ask their
  system for reduced motion.
*/
export const features = {
  /** Hero headline scrambles from random characters into the real words on load. */
  decryptHeadline: true,
  /** Sections ease in as you scroll to them; the stats count up from 0. */
  scrollReveal: true,
  /** A soft glow follows the cursor across cards, with a slight 3D tilt. */
  spotlightCards: true,
  /** Ctrl/⌘ + K opens a search box for pages, projects, posts and quick actions. */
  commandPalette: true,
  /** Pages cross-fade on navigation; project titles glide into the case study. */
  pageTransitions: true,
  /** Soft red (security) and blue (web) glows drifting behind the hero. */
  heroAura: true,
  /** Second headline line fades from red to blue. */
  gradientHeadline: true,
  /** A red → blue light runs along a project card's border, pointing at the cursor. */
  glowCards: true,
  /** Project cards and case-study headers get a red / blue / split top bar. */
  trackColors: true,
  /** The hero terminal types its command before the results appear. */
  typingTerminal: true,
  /** Hero background is a field of slowly shifting glyphs instead of a plain grid. */
  glyphMatrix: true,
  /** A thin red → blue bar under the top edge fills as you scroll. */
  scrollProgress: true,
  /** Light beams run between the four steps in "How I work". */
  methodBeams: true,
}
