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

export async function uploadB2NativeWithRetry(target: { uploadUrl: string; uploadToken: string; key: string }, file: File, sha1: string, attempts = 3) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(target.uploadUrl, {
        method: "POST",
        headers: {
          Authorization: target.uploadToken,
          "X-Bz-File-Name": encodeURIComponent(target.key).replace(/%2F/g, "/"),
          "X-Bz-Content-Sha1": sha1,
          "Content-Type": file.type || "b2/x-auto",
        },
        body: file,
      });
      if (response.ok) return;
      const data = await response.json().catch(() => ({})) as { message?: string };
      const error = new Error(data.message || `O armazenamento recusou o envio (HTTP ${response.status}).`);
      if (response.status < 500 && response.status !== 408 && response.status !== 429) throw error;
      lastError = error;
    } catch (error) { lastError = error; }
    if (attempt < attempts) await new Promise((resolve) => window.setTimeout(resolve, attempt * 1200));
  }
  const detail = lastError instanceof Error && !/Failed to fetch/i.test(lastError.message) ? ` ${lastError.message}` : "";
  throw new Error(`Não foi possível enviar ao Backblaze após ${attempts} tentativas.${detail}`);
}
