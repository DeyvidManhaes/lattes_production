package desenvolvimento.sistemas1.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import desenvolvimento.sistemas1.dto.ArestaDTO;
import desenvolvimento.sistemas1.model.Instituto;
import desenvolvimento.sistemas1.model.Pesquisador;
import desenvolvimento.sistemas1.model.Tipo;
import desenvolvimento.sistemas1.model.Trabalho;
import desenvolvimento.sistemas1.repository.TrabalhoRepository;

@ExtendWith(MockitoExtension.class)
class ContagemServiceTest {

    @Mock
    private TrabalhoRepository trabalhoRepository;

    private ContagemService service;
    private Tipo artigo;
    private Tipo livro;
    private Instituto inst1;
    private Instituto inst2;
    private Pesquisador ana;
    private Pesquisador bia;
    private Pesquisador caio;

    @BeforeEach
    void setUp() {
        service = new ContagemService(trabalhoRepository);

        artigo = tipo(10L, Tipo.ARTIGO_PUBLICADO);
        livro = tipo(12L, Tipo.LIVRO_PUBLICADO);
        inst1 = instituto(1L, "Instituto Um");
        inst2 = instituto(2L, "Instituto Dois");

        // "Ana-Maria" tem hifen no nome: antes isso quebrava a aresta no front.
        ana = pesquisador(1L, "Ana-Maria Silva", inst1);
        bia = pesquisador(2L, "Bia Souza", inst2);
        caio = pesquisador(3L, "Caio Lima", inst2);
    }

    @Test
    void trabalhoCompartilhadoPorTresGeraTresArestas() {
        when(trabalhoRepository.findAll()).thenReturn(List.of(
                trabalho("Um estudo sobre grafos", 2020, ana, artigo),
                trabalho("Um estudo sobre grafos", 2020, bia, artigo),
                trabalho("Um estudo sobre grafos", 2020, caio, artigo)));

        List<ArestaDTO> arestas = service.contarTrabalhosEntrePesquisadores(Set.of());

        assertEquals(3, arestas.size());
        assertTrue(arestas.stream().allMatch(a -> a.quantidade() == 1));
    }

    @Test
    void idsPreservamPesquisadoresComHifenNoNome() {
        when(trabalhoRepository.findAll()).thenReturn(List.of(
                trabalho("Redes complexas", 2019, ana, artigo),
                trabalho("Redes complexas", 2019, bia, artigo)));

        List<ArestaDTO> arestas = service.contarTrabalhosEntrePesquisadores(null);

        assertEquals(1, arestas.size());
        ArestaDTO aresta = arestas.get(0);
        assertEquals(1L, aresta.origemId());
        assertEquals("Ana-Maria Silva", aresta.origemNome());
        assertEquals(2L, aresta.destinoId());
    }

    @Test
    void ignoraDiferencasDeAcentoCaixaEPontuacaoNoTitulo() {
        when(trabalhoRepository.findAll()).thenReturn(List.of(
                trabalho("Análise de Dados: uma Introdução", 2021, ana, livro),
                trabalho("analise de dados uma introducao", 2021, bia, livro)));

        assertEquals(1, service.contarTrabalhosEntrePesquisadores(Set.of()).size());
    }

    @Test
    void naoContaTrabalhosDiferentes() {
        when(trabalhoRepository.findAll()).thenReturn(List.of(
                trabalho("Titulo A", 2020, ana, artigo),
                trabalho("Titulo B", 2020, bia, artigo),
                trabalho("Titulo A", 2021, caio, artigo)));

        assertTrue(service.contarTrabalhosEntrePesquisadores(Set.of()).isEmpty());
    }

    @Test
    void filtraPorTipoDeProducao() {
        when(trabalhoRepository.findAll()).thenReturn(List.of(
                trabalho("Obra em comum", 2018, ana, livro),
                trabalho("Obra em comum", 2018, bia, livro)));

        assertTrue(service.contarTrabalhosEntrePesquisadores(Set.of(10L)).isEmpty());
        assertEquals(1, service.contarTrabalhosEntrePesquisadores(Set.of(12L)).size());
    }

    @Test
    void institutosContamTrabalhoComumEntreInstitutosDiferentes() {
        when(trabalhoRepository.findAll()).thenReturn(List.of(
                trabalho("Projeto conjunto", 2022, ana, artigo),
                trabalho("Projeto conjunto", 2022, bia, artigo),
                trabalho("Projeto conjunto", 2022, caio, artigo)));

        List<ArestaDTO> arestas = service.contarTrabalhosEntreInstitutos(Set.of());

        // Bia e Caio sao do mesmo instituto: so existe a aresta Instituto Um -> Instituto Dois.
        assertEquals(1, arestas.size());
        assertEquals(1, arestas.get(0).quantidade());
        assertEquals("Instituto Um", arestas.get(0).origemNome());
        assertEquals("Instituto Dois", arestas.get(0).destinoNome());
    }

    // ---- helpers ----

    private Tipo tipo(Long id, String nome) {
        Tipo t = new Tipo();
        t.setId(id);
        t.setNome(nome);
        return t;
    }

    private Instituto instituto(Long id, String nome) {
        Instituto i = new Instituto();
        i.setId(id);
        i.setNome(nome);
        i.setAcronimo(nome.substring(0, 3));
        return i;
    }

    private Pesquisador pesquisador(Long id, String nome, Instituto instituto) {
        Pesquisador p = new Pesquisador();
        p.setId(id);
        p.setNome(nome);
        p.setInstituto(instituto);
        return p;
    }

    private Trabalho trabalho(String titulo, long ano, Pesquisador pesquisador, Tipo tipo) {
        Trabalho t = new Trabalho();
        t.setTitulo(titulo);
        t.setAno(ano);
        t.setPesquisador(pesquisador);
        t.setTipo(tipo);
        return t;
    }
}
