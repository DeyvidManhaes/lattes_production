package desenvolvimento.sistemas1.controller;

import java.util.HashSet;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import desenvolvimento.sistemas1.dto.ArestaDTO;
import desenvolvimento.sistemas1.exception.ConflitoException;
import desenvolvimento.sistemas1.exception.RecursoNaoEncontradoException;
import desenvolvimento.sistemas1.exception.RequisicaoInvalidaException;
import desenvolvimento.sistemas1.model.Instituto;
import desenvolvimento.sistemas1.repository.InstitutoRepository;
import desenvolvimento.sistemas1.repository.PesquisadorRepository;
import desenvolvimento.sistemas1.service.ContagemService;

@RestController
@RequestMapping("/instituto")
public class InstitutoController {

    private final InstitutoRepository institutoRepository;
    private final PesquisadorRepository pesquisadorRepository;
    private final ContagemService contagemService;

    public InstitutoController(InstitutoRepository institutoRepository, PesquisadorRepository pesquisadorRepository,
            ContagemService contagemService) {
        this.institutoRepository = institutoRepository;
        this.pesquisadorRepository = pesquisadorRepository;
        this.contagemService = contagemService;
    }

    @GetMapping("/exibir")
    public List<Instituto> exibir() {
        return institutoRepository.findAll();
    }

    @PostMapping("/incluir")
    public ResponseEntity<Map<String, String>> incluir(@RequestBody Instituto instituto) {
        validar(instituto);
        if (institutoRepository.existsByNomeIgnoreCase(instituto.getNome().trim())) {
            throw new ConflitoException("Já existe um instituto com esse nome.");
        }
        if (institutoRepository.existsByAcronimoIgnoreCase(instituto.getAcronimo().trim())) {
            throw new ConflitoException("Já existe um instituto com esse acrônimo.");
        }
        instituto.setId(null); // garante que e uma inclusao
        instituto.setNome(instituto.getNome().trim());
        instituto.setAcronimo(instituto.getAcronimo().trim());
        institutoRepository.save(instituto);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensagem", "Instituto adicionado com sucesso!"));
    }

    @PostMapping("/alterar")
    public ResponseEntity<Map<String, String>> alterar(@RequestBody Instituto instituto) {
        if (instituto.getId() == null) {
            throw new RequisicaoInvalidaException("Informe o id do instituto.");
        }
        validar(instituto);
        Instituto existente = institutoRepository.findById(instituto.getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Instituto não encontrado."));

        String nome = instituto.getNome().trim();
        String acronimo = instituto.getAcronimo().trim();
        if (!nome.equalsIgnoreCase(existente.getNome()) && institutoRepository.existsByNomeIgnoreCase(nome)) {
            throw new ConflitoException("Já existe um instituto com esse nome.");
        }
        if (!acronimo.equalsIgnoreCase(existente.getAcronimo())
                && institutoRepository.existsByAcronimoIgnoreCase(acronimo)) {
            throw new ConflitoException("Já existe um instituto com esse acrônimo.");
        }
        existente.setNome(nome);
        existente.setAcronimo(acronimo);
        institutoRepository.save(existente);
        return ResponseEntity.ok(Map.of("mensagem", "Instituto alterado com sucesso!"));
    }

    @DeleteMapping("/excluir/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!institutoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Instituto não encontrado.");
        }
        if (pesquisadorRepository.existsByInstitutoId(id)) {
            throw new ConflitoException("Não é possível excluir: existem pesquisadores vinculados a este instituto.");
        }
        institutoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /** Arestas do grafo de institutos. Parametro opcional: tipoIds=10,12 (vazio = todos). */
    @GetMapping("/contarTrabalhosEntreInstitutos")
    public List<ArestaDTO> contarTrabalhosEntreInstitutos(
            @RequestParam(name = "tipoIds", required = false) List<Long> tipoIds) {
        return contagemService.contarTrabalhosEntreInstitutos(tipoIds == null ? null : new HashSet<>(tipoIds));
    }

    private void validar(Instituto instituto) {
        if (instituto.getNome() == null || instituto.getNome().isBlank() || instituto.getAcronimo() == null
                || instituto.getAcronimo().isBlank()) {
            throw new RequisicaoInvalidaException("Nome e acrônimo são obrigatórios.");
        }
    }
}
