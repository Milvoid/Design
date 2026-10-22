/** Optional sRGB interpolation for hex anchors. No DOM or chart-library dependency.
 * Preserve the full original group domain when filtering or sorting a view.
 * This helper does not guarantee perceptual uniformity or accessible contrast.
 */
export function sampleRamp(stops, t) {
  if (!Array.isArray(stops) || stops.length < 2 ||
      stops.some(s => typeof s !== 'string' || !/^#[0-9a-f]{6}$/i.test(s))) {
    throw new TypeError('Provide at least two #rrggbb anchors');
  }
  if (!Number.isFinite(t)) throw new TypeError('Position must be finite');
  const position = Math.max(0, Math.min(1, t)) * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(position));
  const mix = position - index;
  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const a = rgb(stops[index]), b = rgb(stops[index + 1]);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * mix)
    .toString(16).padStart(2, '0')).join('');
}

/** IDs must be unique strings in their original semantic order.
 * One group uses the middle anchor, with no implied low/high distinction.
 */
export function orderedColors(ids, stops) {
  if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string') ||
      new Set(ids).size !== ids.length) {
    throw new TypeError('Provide unique string IDs in semantic order');
  }
  sampleRamp(stops, 0); // Validate anchors, including when the domain is empty.
  return new Map(ids.map((id, i) => [id,
    sampleRamp(stops, ids.length === 1 ? 0.5 : i / (ids.length - 1))]));
}
