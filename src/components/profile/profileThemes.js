const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export const DEFAULT_PROFILE_THEME = {
  mode: 'gradient',
  solidColor: '#239a3b',
  gradientFrom: '#7bc96f',
  gradientTo: '#196127',
  gradientAngle: 135,
};

function isValidHex(value) {
  return typeof value === 'string' && HEX_COLOR_RE.test(value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toRgb(hex) {
  const parsed = hex.replace('#', '');
  return {
    r: parseInt(parsed.slice(0, 2), 16),
    g: parseInt(parsed.slice(2, 4), 16),
    b: parseInt(parsed.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mix(hexA, hexB, ratio) {
  const a = toRgb(hexA);
  const b = toRgb(hexB);
  return rgbToHex({
    r: a.r + (b.r - a.r) * ratio,
    g: a.g + (b.g - a.g) * ratio,
    b: a.b + (b.b - a.b) * ratio,
  });
}

export function normalizeProfileTheme(rawTheme) {
  const source = rawTheme && typeof rawTheme === 'object' ? rawTheme : {};
  const mode = source.mode === 'solid' ? 'solid' : 'gradient';
  const solidColor = isValidHex(source.solidColor) ? source.solidColor : DEFAULT_PROFILE_THEME.solidColor;
  const gradientFrom = isValidHex(source.gradientFrom) ? source.gradientFrom : DEFAULT_PROFILE_THEME.gradientFrom;
  const gradientTo = isValidHex(source.gradientTo) ? source.gradientTo : DEFAULT_PROFILE_THEME.gradientTo;
  const angleRaw = Number(source.gradientAngle);
  const gradientAngle = Number.isFinite(angleRaw)
    ? clamp(Math.round(angleRaw), 0, 360)
    : DEFAULT_PROFILE_THEME.gradientAngle;

  return {
    mode,
    solidColor,
    gradientFrom,
    gradientTo,
    gradientAngle,
  };
}

export function buildCalendarTheme(profileTheme) {
  const theme = normalizeProfileTheme(profileTheme);
  const darkBase = '#0b1220';
  const lightBase = '#ebedf0';

  if (theme.mode === 'solid') {
    return {
      calendarEmpty: mix(lightBase, theme.solidColor, 0.18),
      calendarLevels: [
        mix(lightBase, theme.solidColor, 0.35),
        mix(lightBase, theme.solidColor, 0.55),
        mix(lightBase, theme.solidColor, 0.72),
        mix(darkBase, theme.solidColor, 0.8),
      ],
    };
  }

  return {
    calendarEmpty: mix(lightBase, theme.gradientFrom, 0.15),
    calendarLevels: [
      mix(theme.gradientFrom, theme.gradientTo, 0.15),
      mix(theme.gradientFrom, theme.gradientTo, 0.4),
      mix(theme.gradientFrom, theme.gradientTo, 0.65),
      mix(theme.gradientFrom, theme.gradientTo, 0.9),
    ],
  };
}

export function toThemeCssBackground(profileTheme) {
  const theme = normalizeProfileTheme(profileTheme);
  if (theme.mode === 'solid') {
    return theme.solidColor;
  }
  return `linear-gradient(${theme.gradientAngle}deg, ${theme.gradientFrom}, ${theme.gradientTo})`;
}
