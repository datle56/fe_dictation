export const slugToTitle: Record<string, string> = {
  american: "Dictation Practice",
  ielts: "IELTS Listening",
  toeic: "TOEIC Listening",
  stories: "Short Stories",
  conversations: "Daily Conversations",
  youtube: "YouTube",
  toefl: "TOEFL Listening",
  spelling: "Spelling Names",
  news: "World News",
  // ... thêm các slug khác nếu có
};
export const titleToSlug: Record<string, string> = Object.fromEntries(
  Object.entries(slugToTitle).map(([slug, title]) => [title, slug])
); 