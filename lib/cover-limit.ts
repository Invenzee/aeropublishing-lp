import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const store = path.join(process.cwd(), "data", "cover-used.json");

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = (forwarded?.split(",")[0] || request.headers.get("x-real-ip") || "local").trim();
  return createHash("sha256").update(`aero-cover:${ip}`).digest("hex");
}

async function readKeys() {
  try {
    const raw = await readFile(store, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function coverAlreadyUsed(request: Request) {
  const key = clientKey(request);
  const keys = await readKeys();
  return keys.includes(key);
}

export async function markCoverUsed(request: Request) {
  const key = clientKey(request);
  const keys = await readKeys();
  if (keys.includes(key)) return;
  await mkdir(path.dirname(store), { recursive: true });
  await writeFile(store, JSON.stringify([...keys, key]), "utf8");
}
