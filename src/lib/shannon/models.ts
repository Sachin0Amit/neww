/**
 * Shannon - Model Resolution
 * Maps model tiers to concrete LLM model IDs
 */

export type ModelTier = 'small' | 'medium' | 'large';

const DEFAULT_MODELS: Readonly<Record<ModelTier, string>> = {
  small: 'glm-4-flash',
  medium: 'glm-4-plus',
  large: 'glm-4-plus',
};

/** Resolve a model tier to a concrete model ID. */
export function resolveModel(tier: ModelTier = 'medium'): string {
  switch (tier) {
    case 'small':
      return process.env.SHANNON_SMALL_MODEL || DEFAULT_MODELS.small;
    case 'large':
      return process.env.SHANNON_LARGE_MODEL || DEFAULT_MODELS.large;
    default:
      return process.env.SHANNON_MEDIUM_MODEL || DEFAULT_MODELS.medium;
  }
}

/** Get the display name for a model ID. */
export function getModelDisplayName(modelId: string): string {
  const displayNames: Record<string, string> = {
    'glm-4-flash': 'GLM-4 Flash',
    'glm-4-plus': 'GLM-4 Plus',
    'claude-opus-4-7': 'Claude Opus 4.7',
    'claude-sonnet-4-6': 'Claude Sonnet 4.6',
    'claude-haiku-4-5-20251001': 'Claude Haiku 4.5',
  };
  return displayNames[modelId] || modelId;
}

/** Whether a model supports adaptive thinking. */
export function supportsAdaptiveThinking(_model: string): boolean {
  return false;
}
