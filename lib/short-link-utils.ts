import { customAlphabet } from "nanoid";

const SLUG_LENGTH = 7;
const SLUG_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const MAX_RETRIES = 3;

const generateNanoSlug = customAlphabet(SLUG_ALPHABET, SLUG_LENGTH);

export async function generateSlug(
  checkExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const slug = generateNanoSlug();
    const exists = await checkExists(slug);

    if (!exists) {
      return slug;
    }
  }

  throw new Error(
    "Não foi possível gerar um slug único após múltiplas tentativas",
  );
}
