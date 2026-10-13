// ─── Markdown Sanitizer & Table Formatter ───
// Converts messy pipe tables, broken separator lines, and raw symbols into clean,
// elegant bulleted cards and bold metrics that render perfectly in ReactMarkdown.

export const cleanMarkdownText = (raw) => {
  if (!raw) return "";

  let text = String(raw)
    // 1. Strip reasoning and thinking tokens
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*$/gi, '')
    .replace(/\[THINKING\][\s\S]*?\[\/THINKING\]/gi, '')
    .trim();

  // 2. Fix malformed custom link syntax
  text = text.replace(/\]\[(salon:[^\]\n]+)\]/g, ']($1)');
  text = text.replace(/\]\[(salon:[^)\n]+)$/g, ']($1)');
  text = text.replace(/(\[[^\]]+\])\((salon:[^)\s]+)$/, '$1($2)');

  // 3. Normalize compressed single-line tables (e.g., || into |\n|)
  text = text.replace(/\|\s*\|/g, '|\n|');

  // 4. Transform pipe-delimited table rows into clean bullet points
  const lines = text.split('\n');
  const cleanedLines = [];
  let inTable = false;
  let headers = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if line is a table row (starts and ends with | or contains at least two |)
    const isTableRow = (line.startsWith('|') || line.endsWith('|')) && (line.match(/\|/g) || []).length >= 2;

    if (isTableRow) {
      const cells = line
        .split('|')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      // Check if this is a dashed separator line like |---|---|
      const isSeparator = cells.every(c => /^[-: ]+$/.test(c));

      if (isSeparator) {
        inTable = true;
        continue;
      }

      // Check if this looks like a generic table header (Metric, Value, Header, Name, etc.)
      const isHeaderRow = !inTable && (
        cells.some(c => /^(metric|value|interpretation|salon|service|price|header|category|duration|action|book now|status)$/i.test(c)) ||
        (i + 1 < lines.length && /^\|?[-: ]+\|?$/.test(lines[i + 1].trim()))
      );

      if (isHeaderRow) {
        headers = cells;
        inTable = true;
        continue;
      }

      // Format data row
      if (cells.length === 1) {
        cleanedLines.push(`• ${cells[0]}`);
      } else if (cells.length === 2) {
        cleanedLines.push(`• **${cells[0]}:** ${cells[1]}`);
      } else if (cells.length === 3) {
        cleanedLines.push(`• **${cells[0]}:** ${cells[1]} — *${cells[2]}*`);
      } else if (cells.length >= 4) {
        const title = cells[0];
        const primary = cells[1];
        const secondary = cells.slice(2).join(' · ');
        cleanedLines.push(`• **${title}:** ${primary} (${secondary})`);
      }
    } else {
      inTable = false;
      headers = [];
      // Also clean up any trailing lonely pipe symbols like "text |"
      const cleaned = line.replace(/^\s*\|\s*/, '').replace(/\s*\|\s*$/, '');
      cleanedLines.push(cleaned);
    }
  }

  // 5. Clean up redundant newlines
  return cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
};
