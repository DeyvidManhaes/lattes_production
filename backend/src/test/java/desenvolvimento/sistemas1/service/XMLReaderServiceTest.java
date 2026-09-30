package desenvolvimento.sistemas1.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import desenvolvimento.sistemas1.exception.RecursoNaoEncontradoException;
import desenvolvimento.sistemas1.exception.RequisicaoInvalidaException;
import desenvolvimento.sistemas1.service.XMLReaderService.CurriculoLattes;
import desenvolvimento.sistemas1.service.XMLReaderService.TrabalhoExtraido;

class XMLReaderServiceTest {

    private XMLReaderService service;

    @BeforeEach
    void setUp() {
        service = new XMLReaderService();
        // O Maven executa os testes a partir da pasta backend/
        ReflectionTestUtils.setField(service, "curriculosDir", "curriculos_xml");
    }

    @Test
    void leCurriculoValidoComPesquisadorETrabalhos() {
        CurriculoLattes curriculo = service.lerCurriculo("0743793296062293");

        assertEquals(743793296062293L, curriculo.pesquisador().getId());
        assertEquals("Daniel Cardoso Moraes de Oliveira", curriculo.pesquisador().getNome());
        assertNotNull(curriculo.pesquisador().getEmail());
        assertFalse(curriculo.trabalhos().isEmpty());

        for (TrabalhoExtraido extraido : curriculo.trabalhos()) {
            assertFalse(extraido.trabalho().getTitulo().isBlank());
            assertNotNull(extraido.trabalho().getAno());
            assertFalse(extraido.nomesCitacao().isBlank());
            assertFalse(extraido.nomesCitacao().startsWith(","));
        }
    }

    @Test
    void rejeitaIdentificadorComCaracteresDeCaminho() {
        assertThrows(RequisicaoInvalidaException.class, () -> service.lerCurriculo("../../etc/passwd"));
    }

    @Test
    void rejeitaIdentificadorNulo() {
        assertThrows(RequisicaoInvalidaException.class, () -> service.lerCurriculo(null));
    }

    @Test
    void informaQuandoOArquivoNaoExiste() {
        assertThrows(RecursoNaoEncontradoException.class, () -> service.lerCurriculo("0000000000000001"));
    }

    @Test
    void geraEmailSemAcentosEComDominioReservado() {
        String email = XMLReaderService.gerarEmail("Ângela Maria D'Ávila");
        assertEquals("angeladavila@lattes.invalid", email);
        assertTrue(email.endsWith(".invalid"));
    }
}
