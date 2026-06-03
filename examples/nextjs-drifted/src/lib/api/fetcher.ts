export async function requestJson(url: string) {
  const response = await fetch(url);
  return response.json();
}
