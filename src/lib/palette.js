// Pastel habit colors, in the spirit of the original DailyHabits grid.
export const PALETTE = [
  '#E6D9A8', // sand
  '#BFCBE8', // periwinkle
  '#CCC1E8', // lavender
  '#BBD9B5', // sage
  '#EAC8C8', // rose
  '#BFDDE8', // sky
  '#F0D5B4', // peach
  '#D9D9D9', // gray
]

export const randomColor = () =>
  PALETTE[Math.floor(Math.random() * PALETTE.length)]
