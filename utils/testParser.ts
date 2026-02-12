export function detectTestSuccess(output: string): boolean {
  if (!output) return false;

  return (
    output.includes("fail 0") ||
    output.includes("0 failing") ||
    output.includes("pass 1") && !output.includes("fail 1")
  );
}
