export const isNumber = (n: number) => {
  return !isNaN(parseFloat(n.toString())) && isFinite(n);
}