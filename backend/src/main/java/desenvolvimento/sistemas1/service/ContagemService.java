package desenvolvimento.sistemas1.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import desenvolvimento.sistemas1.dto.ArestaDTO;
import desenvolvimento.sistemas1.model.Trabalho;
import desenvolvimento.sistemas1.repository.TrabalhoRepository;

/**
 * Calcula as arestas do grafo: para cada par de pesquisadores (ou institutos),
 * quantos trabalhos distintos eles tem em comum.
 *
 * Os trabalhos sao agrupados por chave (titulo normalizado + ano + tipo) e, em
 * cada grupo, todos os pares de vertices envolvidos ganham +1. Assim um
 * trabalho compartilhado por 3 pesquisadores gera as 3 arestas, e o custo e
 * linear no numero de trabalhos (antes era quadratico).
 */
@Service
public class ContagemService {

    private final TrabalhoRepository trabalhoRepository;

    public ContagemService(TrabalhoRepository trabalhoRepository) {
        this.trabalhoRepository = trabalhoRepository;
    }

    private record Vertice(Long id, String nome) {
    }

    @Transactional(readOnly = true)
    public List<ArestaDTO> contarTrabalhosEntrePesquisadores(Set<Long> tipoIds) {
        return contar(tipoIds, t -> t.getPesquisador() == null ? null
                : new Vertice(t.getPesquisador().getId(), t.getPesquisador().getNome()));
    }

    @Transactional(readOnly = true)
    public List<ArestaDTO> contarTrabalhosEntreInstitutos(Set<Long> tipoIds) {
        return contar(tipoIds, t -> t.getPesquisador() == null || t.getPesquisador().getInstituto() == null ? null
                : new Vertice(t.getPesquisador().getInstituto().getId(), t.getPesquisador().getInstituto().getNome()));
    }

    /** tipoIds vazio (ou nulo) significa "todos os tipos". */
    private List<ArestaDTO> contar(Set<Long> tipoIds, Function<Trabalho, Vertice> extrator) {
        Set<Long> filtro = tipoIds == null ? Set.of() : tipoIds;

        // chave do trabalho -> vertices (por id) que possuem esse trabalho
        Map<String, Map<Long, Vertice>> verticesPorTrabalho = new HashMap<>();
        for (Trabalho trabalho : trabalhoRepository.findAll()) {
            if (!filtro.isEmpty() && (trabalho.getTipo() == null || !filtro.contains(trabalho.getTipo().getId()))) {
                continue;
            }
            Vertice vertice = extrator.apply(trabalho);
            if (vertice == null || vertice.id() == null) {
                continue;
            }
            verticesPorTrabalho.computeIfAbsent(TrabalhoUtils.chave(trabalho), k -> new HashMap<>())
                    .put(vertice.id(), vertice);
        }

        Map<List<Long>, Integer> contagem = new HashMap<>();
        Map<Long, Vertice> vertices = new HashMap<>();
        for (Map<Long, Vertice> grupo : verticesPorTrabalho.values()) {
            if (grupo.size() < 2) {
                continue;
            }
            List<Vertice> ordenados = new ArrayList<>(grupo.values());
            ordenados.sort(Comparator.comparing(Vertice::id));
            for (int i = 0; i < ordenados.size(); i++) {
                for (int j = i + 1; j < ordenados.size(); j++) {
                    Vertice a = ordenados.get(i);
                    Vertice b = ordenados.get(j);
                    vertices.put(a.id(), a);
                    vertices.put(b.id(), b);
                    contagem.merge(List.of(a.id(), b.id()), 1, Integer::sum);
                }
            }
        }

        List<ArestaDTO> arestas = new ArrayList<>();
        contagem.forEach((par, quantidade) -> {
            Vertice a = vertices.get(par.get(0));
            Vertice b = vertices.get(par.get(1));
            arestas.add(new ArestaDTO(a.id(), a.nome(), b.id(), b.nome(), quantidade));
        });
        arestas.sort(Comparator.comparing(ArestaDTO::origemNome, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                .thenComparing(ArestaDTO::destinoNome, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));
        return arestas;
    }
}
