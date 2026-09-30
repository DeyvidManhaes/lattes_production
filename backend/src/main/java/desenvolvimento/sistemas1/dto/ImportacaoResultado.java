package desenvolvimento.sistemas1.dto;

/** Resumo da importacao de um curriculo Lattes. */
public record ImportacaoResultado(Long pesquisadorId, String nome, int trabalhosImportados, int trabalhosIgnorados,
        String mensagem) {
}
