export const DEFAULT_PROFILE_THEME_PRESET = 'paper';

export const PROFILE_THEME_PRESETS = {
  paper: {
    label: 'Paper',
    style: {
      background: 'linear-gradient(135deg, #f6f7f2 0%, #edeadf 100%)',
    },
  },
  mint: {
    label: 'Mint',
    style: {
      background: 'linear-gradient(140deg, #e7fff4 0%, #c8f0df 45%, #a8ddcc 100%)',
    },
  },
  ocean: {
    label: 'Ocean',
    style: {
      background: 'linear-gradient(135deg, #e8f4ff 0%, #c6dcff 50%, #9db9f6 100%)',
    },
  },
  dusk: {
    label: 'Dusk',
    style: {
      background: 'linear-gradient(145deg, #f6efe8 0%, #e4d5c9 55%, #c8b19a 100%)',
    },
  },
};

export function normalizeProfileThemePreset(rawPreset) {
  if (typeof rawPreset !== 'string') {
    return DEFAULT_PROFILE_THEME_PRESET;
  }
  return PROFILE_THEME_PRESETS[rawPreset] ? rawPreset : DEFAULT_PROFILE_THEME_PRESET;
}

export function normalizeProfileBackgroundUrl(rawUrl) {
  if (typeof rawUrl !== 'string') {
    return null;
  }
  const trimmed = rawUrl.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getThemePreviewStyle(themePreset) {
  const presetKey = normalizeProfileThemePreset(themePreset);
  return PROFILE_THEME_PRESETS[presetKey].style;
}

export function getProfileBackgroundStyle(themePreset, backgroundImageUrl) {
  const imageUrl = normalizeProfileBackgroundUrl(backgroundImageUrl);
  if (imageUrl) {
    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }
  return getThemePreviewStyle(themePreset);
}
