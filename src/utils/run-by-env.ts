type EnvActions<T> = {
  onLiveENVs: () => Promise<T> | T;
  onMockENVs: () => Promise<T> | T;
  onDefault?: () => Promise<T> | T;
};

export async function runByEnv<T>(actions: EnvActions<T>): Promise<T> {
  const customEnv = import.meta.env.VITE_CUSTOM_ENV_VAR;
  const nodeEnv = process.env.NODE_ENV;

  // 👇 If explicitly set to live envs
  if (["develop", "qa", "stg", "prd", "prod", "production"].includes(customEnv)) {
    return actions.onLiveENVs();
  }

  // 👇 Otherwise treat development or unspecified as mock
  if (nodeEnv === "development") {
    return actions.onMockENVs();
  }

  // 👇 Fallback if nothing matches
  const fallback = actions.onDefault ?? actions.onMockENVs;
  return fallback();
}
