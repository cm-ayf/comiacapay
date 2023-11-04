"use server";

export default async function ErrorComponent({ error }: { error: Error }) {
  return JSON.stringify(error);
}
