import { AnalysisMetrics, FlyMemory } from '@/types/fly';

const STORAGE_KEY = 'flyeye_drosophila_memory_v1';

export const INITIAL_MEMORY: FlyMemory = {
  testsCount: 0,
  rewardsCount: 0,
  shocksCount: 0,
  totalSynapticUpdates: 0,
  learnedWeights: {
    contrastPreference: 0.0,
    phototaxisPreference: 0.0,
    uvBluePreference: 0.0,
    giantFiberSensitivity: 0.0,
  },
};

export function getStoredFlyMemory(): FlyMemory {
  if (typeof window === 'undefined') return INITIAL_MEMORY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_MEMORY;
    return JSON.parse(raw);
  } catch {
    return INITIAL_MEMORY;
  }
}

export function saveFlyMemory(memory: FlyMemory) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch (err) {
    console.error('Failed to save fly memory', err);
  }
}

export function resetFlyMemory(): FlyMemory {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return INITIAL_MEMORY;
}

/**
 * Mushroom Body Dopaminergic Plasticity Rule:
 * Δw = η * Reward * Stimulus_Feature
 */
export function applyDopamineFeedback(
  type: 'sugar' | 'shock',
  metrics: AnalysisMetrics
): { memory: FlyMemory; message: string; synapsesChanged: number } {
  const memory = getStoredFlyMemory();
  const isReward = type === 'sugar';
  const sign = isReward ? 1 : -1;
  const learningRate = 0.12;

  // Measure relative feature dominance
  const contrastFeature = (metrics.edgeContrast - 50) / 50;
  const phototaxisFeature = (metrics.phototaxisScore - 50) / 50;
  const uvBlueFeature = (metrics.spectralUVBlue - 50) / 50;
  const escapeFeature = (metrics.giantFiberReflex - 20) / 50;

  // Update weights
  memory.learnedWeights.contrastPreference = clampWeight(
    memory.learnedWeights.contrastPreference + sign * learningRate * contrastFeature
  );
  memory.learnedWeights.phototaxisPreference = clampWeight(
    memory.learnedWeights.phototaxisPreference + sign * learningRate * phototaxisFeature
  );
  memory.learnedWeights.uvBluePreference = clampWeight(
    memory.learnedWeights.uvBluePreference + sign * learningRate * uvBlueFeature
  );
  memory.learnedWeights.giantFiberSensitivity = clampWeight(
    memory.learnedWeights.giantFiberSensitivity - sign * learningRate * escapeFeature
  );

  const synapsesChanged = Math.floor(180 + Math.random() * 120);
  memory.totalSynapticUpdates += synapsesChanged;

  if (isReward) {
    memory.rewardsCount += 1;
  } else {
    memory.shocksCount += 1;
  }

  saveFlyMemory(memory);

  const message = isReward
    ? `🍬 Sugar Water absorbed! Mushroom Body Kenyon cells released dopamine. +${synapsesChanged} synaptic connections reinforced.`
    : `⚡ Electric shock delivered! Octopamine & avoidance pathways sensitized. -${synapsesChanged} synapses rewired to avoid this aesthetic.`;

  return { memory, message, synapsesChanged };
}

/**
 * Modulate biological icon evaluation based on accumulated experience
 */
export function applyMemoryToMetrics(metrics: AnalysisMetrics, memory: FlyMemory): AnalysisMetrics {
  const contrastMod = memory.learnedWeights.contrastPreference * 15;
  const photoMod = memory.learnedWeights.phototaxisPreference * 15;
  const uvMod = memory.learnedWeights.uvBluePreference * 15;
  const giantMod = memory.learnedWeights.giantFiberSensitivity * 10;

  const adjustedAttractiveness = Math.min(
    99,
    Math.max(10, Math.round(metrics.overallAttractiveness + contrastMod + photoMod + uvMod - giantMod))
  );

  const adjustedDopamine = Math.min(
    100,
    Math.max(-50, Math.round(metrics.dopamineDelta + (contrastMod + photoMod + uvMod) * 1.2))
  );

  return {
    ...metrics,
    overallAttractiveness: adjustedAttractiveness,
    dopamineDelta: adjustedDopamine,
  };
}

function clampWeight(w: number): number {
  return Math.min(1.0, Math.max(-1.0, Math.round(w * 100) / 100));
}
