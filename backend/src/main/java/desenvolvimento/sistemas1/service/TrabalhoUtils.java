package desenvolvimento.sistemas1.service;

import java.text.Normalizer;
import java.util.Locale;

import desenvolvimento.sistemas1.model.Trabalho;

/**
 * Identifica quando dois registros representam o mesmo trabalho (mesmo trabalho
 * cadastrado por autores diferentes). Compara titulo normalizado (sem acentos,
 * pontuacao ou diferenca de maiusculas), ano e tipo.
 */
public final class TrabalhoUtils {

    private TrabalhoUtils() {
    }

    public static String normalizar(String texto) {
        if (texto == null) {
            return "";
        }
        String semAcento = Normalizer.normalize(texto, Normalizer.Form.NFD).replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return semAcento.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", " ").trim();
    }

    public static String chave(Trabalho trabalho) {
        Long tipoId = trabalho.getTipo() != null ? trabalho.getTipo().getId() : null;
        return normalizar(trabalho.getTitulo()) + "|" + trabalho.getAno() + "|" + tipoId;
    }
}
