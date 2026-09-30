// Configuração central da comunicação com o back-end.
// A URL vem da variável REACT_APP_API_URL (veja .env.example); o padrão é o back-end local.
export const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

/**
 * Extrai a mensagem de erro devolvida pelo back-end ({"mensagem": "..."}).
 * Se a resposta não tiver esse formato, usa o texto HTTP como alternativa.
 */
export async function mensagemDeErro(response) {
  try {
    const corpo = await response.json();
    if (corpo && corpo.mensagem) {
      return corpo.mensagem;
    }
  } catch (e) {
    // corpo vazio ou não-JSON: cai no texto padrão abaixo
  }
  return `${response.status} ${response.statusText}`.trim();
}
