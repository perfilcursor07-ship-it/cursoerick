/** Chamadas de API usadas pelos componentes do navegador. */
export async function api(path, { method = 'GET', body, ...rest } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const error = new Error(data.error || 'Nao foi possivel completar a acao');
    error.fields = data.fields || {};
    error.status = res.status;
    throw error;
  }

  return data;
}

/**
 * Upload de arquivo com barra de progresso.
 * Usa XMLHttpRequest porque o fetch nao reporta progresso de envio.
 *
 * kind = 'video' (padrao) ou 'cover' (imagem de capa)
 */
export function uploadFile(file, onProgress, kind = 'video') {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      'POST',
      `/api/admin/upload?filename=${encodeURIComponent(file.name)}&kind=${kind}`
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = {};
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error(data.error || 'Falha no upload do arquivo'));
    };

    xhr.onerror = () => reject(new Error('Falha de conexao durante o upload'));
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.send(file);
  });
}

/** Atalho para manter compatibilidade com as chamadas de video. */
export function uploadVideo(file, onProgress) {
  return uploadFile(file, onProgress, 'video');
}
