export type BookBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "quote"; text: string; source?: string }
  | { type: "callout"; title: string; text: string; variant?: "emerald" | "sky" | "amber" | "slate" }
  | { type: "citation"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "divider" }
  | { type: "paragraph"; text: string };

/**
 * Converts English numbers to Bengali digits
 */
export function toBengaliNumerals(num: number | string): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (d) => bnDigits[Number(d)] ?? d);
}

/**
 * Parses raw chapter text (Markdown, formatted text, or plain text) into structured book layout blocks.
 */
export function parseChapterContent(rawText: string): BookBlock[] {
  if (!rawText) return [];

  // Normalize line endings
  const lines = rawText.replace(/\r\n?/g, "\n").split("\n");
  const blocks: BookBlock[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]?.trim() ?? "";

    if (!line) {
      i++;
      continue;
    }

    // 1. Divider / Separator (--- or *** or ___)
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(line)) {
      blocks.push({ type: "divider" });
      i++;
      continue;
    }

    // 2. Callout Box :::box[Title] ... ::: or > [!NOTE] or [বক্স: শিরোনাম] ... [/বক্স]
    if (line.startsWith(":::box") || line.startsWith(":::callout") || line.startsWith("[বক্স:")) {
      let title = "বিশেষ দ্রষ্টব্য";
      const titleMatch = line.match(/(?:\[|:::box\[|:::callout\[)([^\]]+)\]/);
      if (titleMatch) {
        title = titleMatch[1].trim();
      } else if (line.includes(":")) {
        const parts = line.split(":");
        if (parts[1]) title = parts[1].replace(/[\]]/g, "").trim();
      }

      let boxText = "";
      i++;
      while (i < lines.length && !lines[i].startsWith(":::") && !lines[i].includes("[/বক্স]")) {
        boxText += (boxText ? "\n" : "") + lines[i];
        i++;
      }
      if (i < lines.length && (lines[i].startsWith(":::") || lines[i].includes("[/বক্স]"))) {
        i++; // skip closing tag
      }

      // Detect variant from title
      let variant: "emerald" | "sky" | "amber" | "slate" = "emerald";
      const lowTitle = title.toLowerCase();
      if (lowTitle.includes("ইসলাম") || lowTitle.includes("কোরআন") || lowTitle.includes("হাদিস") || lowTitle.includes("সফলতা")) {
        variant = "emerald";
      } else if (lowTitle.includes("টিপস") || lowTitle.includes("পরামর্শ") || lowTitle.includes("তথ্য")) {
        variant = "sky";
      } else if (lowTitle.includes("সতর্ক") || lowTitle.includes("গুরুত্বপূর্ণ") || lowTitle.includes("মনে রাখুন")) {
        variant = "amber";
      }

      blocks.push({
        type: "callout",
        title: title || "ইসলামের আলোকে",
        text: boxText.trim(),
        variant,
      });
      continue;
    }

    // Check for inline callout syntax like "> [!NOTE] Title"
    if (/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|ISLAM)\]/i.test(line)) {
      const match = line.match(/^>\s*\[!([A-Z]+)\]\s*(.*)$/i);
      const tag = (match?.[1] || "NOTE").toUpperCase();
      let title = match?.[2]?.trim() || (tag === "ISLAM" ? "ইসলামের আলোকে" : tag === "TIP" ? "টিপস" : "বিশেষ দ্রষ্টব্য");
      let boxText = "";
      i++;
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        boxText += (boxText ? "\n" : "") + lines[i].replace(/^>\s?/, "");
        i++;
      }
      let variant: "emerald" | "sky" | "amber" | "slate" = "emerald";
      if (tag === "ISLAM" || title.includes("ইসলাম")) variant = "emerald";
      else if (tag === "TIP") variant = "sky";
      else if (tag === "WARNING" || tag === "IMPORTANT") variant = "amber";
      else variant = "slate";

      blocks.push({
        type: "callout",
        title,
        text: boxText.trim(),
        variant,
      });
      continue;
    }

    // 3. Citations & Footnotes (starts with তথ্যসূত্র:, সূত্র:, Reference:, Source:)
    if (/^(তথ্যসূত্র|সূত্র|রেফারেন্স|গ্রন্থপঞ্জি|উৎস|References?|Sources?):/iu.test(line)) {
      blocks.push({
        type: "citation",
        text: line,
      });
      i++;
      continue;
    }

    // 4. Epigraph / Blockquotes (lines starting with > or enclosed in special quotes)
    if (line.startsWith(">")) {
      let quoteText = line.replace(/^>\s?/, "");
      i++;
      while (i < lines.length && lines[i].trim().startsWith(">") && !lines[i].includes("[!")) {
        quoteText += " " + lines[i].replace(/^>\s?/, "").trim();
        i++;
      }
      let source: string | undefined;
      if (quoteText.includes("—") || quoteText.includes("--")) {
        const parts = quoteText.split(/—|--/);
        quoteText = parts[0].trim();
        source = parts.slice(1).join("—").trim();
      }
      blocks.push({
        type: "quote",
        text: quoteText.trim(),
        source,
      });
      continue;
    }

    // 5. Headings (### or ## or #)
    if (line.startsWith("#")) {
      const match = line.match(/^(#{1,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length as 1 | 2 | 3;
        blocks.push({
          type: "heading",
          level,
          text: match[2].trim(),
        });
        i++;
        continue;
      }
    }

    // 6. Styled List items (- or * or 1.)
    if (/^(\*|-|\d+\.)\s+/.test(line)) {
      const items: string[] = [];
      const ordered = /^\d+\.\s+/.test(line);
      while (i < lines.length && /^(\*|-|\d+\.)\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^(\*|-|\d+\.)\s+/, ""));
        i++;
      }
      blocks.push({
        type: "list",
        items,
        ordered,
      });
      continue;
    }

    // 7. Regular Paragraph
    let pText = line;
    i++;
    // Combine soft wrapped lines
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith(":::") &&
      !lines[i].trim().startsWith("[বক্স:") &&
      !/^(\*|-|\d+\.)\s+/.test(lines[i].trim()) &&
      !/^(তথ্যসূত্র|সূত্র|রেফারেন্স|গ্রন্থপঞ্জি|উৎস|References?|Sources?):/iu.test(lines[i].trim())
    ) {
      pText += " " + lines[i].trim();
      i++;
    }

    blocks.push({
      type: "paragraph",
      text: pText.trim(),
    });
  }

  return blocks;
}
