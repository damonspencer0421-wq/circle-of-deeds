// Six characters after the dash and any spaces are ignored. Returns a
// friendly message, or null when the code is ready to open.
export function normalizeDeedCode(raw) {
  return String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function codeEntryMessage(raw) {
  const code = normalizeDeedCode(raw);
  if (code.length === 6) return null;
  if (code.length === 0) return "Enter the 6-character code. The dash doesn't count.";
  if (code.length < 6) {
    const word = code.length === 1 ? "character" : "characters";
    return `That's ${code.length} ${word}. Codes are 6, like 7K3-MDP.`;
  }
  return "That's more than 6 characters. Codes are 6, and the dash doesn't count.";
}
