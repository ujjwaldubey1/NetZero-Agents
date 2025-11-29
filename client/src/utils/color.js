// Generate 100 distinct shades of colors
export const generateColors = () => {
  const colors = [];
  const saturation = 70;
  const lightness = 60;

  for (let i = 0; i < 100; i++) {
    const hue = Math.floor((i * 360) / 100);
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
};

export const colors = generateColors();

// Helper to get a random color from the palette
export const getRandomColor = () => {
  return colors[Math.floor(Math.random() * colors.length)];
};
