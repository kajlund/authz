export const cleanObj = (obj) => {
  return Object.fromEntries(
    // eslint-disable-next-line no-unused-vars
    Object.entries(obj).filter(([_, value]) => value != null && value !== ''),
  );
};

export const patchEntity = (
  currentEntity,
  incomingBody,
  allowedKeys,
  options = {},
) => {
  const { allowEmpty = false } = options;

  const updates = Object.keys(incomingBody)
    // 1. Only allow specific keys
    .filter((key) => allowedKeys.includes(key))
    // 2. Decide what is "meaningful"
    .filter((key) => {
      const val = incomingBody[key];
      if (allowEmpty) return true; // Take everything sent
      return val !== '' && val !== null && val !== undefined;
    })
    // 3. Build the update object
    .reduce((acc, key) => {
      acc[key] = incomingBody[key];
      return acc;
    }, {});

  // 4. Return the merged result
  return { ...currentEntity, ...updates };
};
