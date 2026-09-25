export async function uploadFileWithRetry(url: string, file: File, attempts = 3) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
      if (response.ok) return;
      const error = new Error(`O armazenamento recusou o envio (HTTP ${response.status}).`);
      if (response.status < 500 && response.status !== 408 && response.status !== 429) throw error;
      lastError = error;
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) await new Promise((resolve) => window.setTimeout(resolve, attempt * 1200));
  }
  const detail = lastError instanceof Error && !/Failed to fetch/i.test(lastError.message) ? ` ${lastError.message}` : "";
  throw new Error(`Não foi possível conectar ao armazenamento após ${attempts} tentativas.${detail}`);
}
