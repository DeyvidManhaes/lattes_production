package desenvolvimento.sistemas1.dto;

/**
 * Aresta do grafo: quantidade de trabalhos em comum entre dois vertices
 * (pesquisadores ou institutos). Os ids evitam ambiguidade com nomes repetidos
 * ou que contenham hifen.
 */
public record ArestaDTO(Long origemId, String origemNome, Long destinoId, String destinoNome, int quantidade) {
}
