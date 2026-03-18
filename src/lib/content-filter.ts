const BLOCKED_PATTERNS_EN = [
  // Violence
  /\b(kill|murder|stab|shoot|bomb|terror|torture|rape|assault|weapon|gun|knife|blood|gore|dismember|behead|suicide|self.?harm)\b/i,
  // Sexual
  /\b(sex|porn|nude|naked|dick|cock|pussy|penis|vagina|boob|tit|cum|orgasm|masturbat|erotic|hentai|nsfw|xxx|blowjob|handjob|anal)\b/i,
  // Hate
  /\b(nigger|nigga|faggot|retard|chink|spic|kike)\b/i,
  // Drugs
  /\b(cocaine|heroin|meth|crack|fentanyl)\b/i,
];

const BLOCKED_PATTERNS_CN = [
  // Violence
  /(?:杀人|砍人|捅人|爆炸|恐怖|虐待|强奸|自杀|自残|割腕)/,
  // Sexual
  /(?:色情|做爱|性交|裸体|阴茎|阴道|乳房|手淫|自慰|口交|肛交|黄片|约炮)/,
  // Hate/slurs
  /(?:支那|蝗虫|黑鬼|白皮猪)/,
];

export function isContentBlocked(text: string): boolean {
  for (const pattern of BLOCKED_PATTERNS_EN) {
    if (pattern.test(text)) return true;
  }
  for (const pattern of BLOCKED_PATTERNS_CN) {
    if (pattern.test(text)) return true;
  }
  return false;
}

export const CONTENT_WARNING = "Your message contains inappropriate content. Please keep it friendly and respectful.";
