const flattenValues = (values: unknown[]): string[] => {
  const flattened: string[] = [];

  values.forEach((value) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      flattened.push(...flattenValues(value));
      return;
    }

    flattened.push(String(value));
  });

  return flattened;
};

const buildSearchBlobs = (values: unknown[]) => {
  const flattened = flattenValues(values).map((value) => value.trim()).filter(Boolean);
  const textBlob = flattened.join(" ").toLowerCase();
  const digitBlob = flattened.join("").replace(/\D/g, "");
  return { textBlob, digitBlob };
};

export const matchesDynamicSearch = (query: string, values: unknown[]): boolean => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const { textBlob, digitBlob } = buildSearchBlobs(values);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  if (tokens.length === 0) return true;

  return tokens.every((token) => {
    if (textBlob.includes(token)) return true;

    const numericToken = token.replace(/\D/g, "");
    if (numericToken && digitBlob.includes(numericToken)) return true;

    return false;
  });
};
