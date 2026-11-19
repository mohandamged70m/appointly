"use cache";

export async function getToday(): Promise<string> {
  return new Date().toISOString().slice(0, 10);
}
