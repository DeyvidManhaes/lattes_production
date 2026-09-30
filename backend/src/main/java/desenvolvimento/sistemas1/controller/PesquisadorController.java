package desenvolvimento.sistemas1.controller;

import java.util.HashSet;
import java.util.List;

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
import desenvolvimento.sistemas1.dto.ImportacaoResultado;
import desenvolvimento.sistemas1.model.Pesquisador;
import desenvolvimento.sistemas1.model.PesquisadorRequest;
import desenvolvimento.sistemas1.repository.PesquisadorRepository;
import desenvolvimento.sistemas1.service.ContagemService;
import desenvolvimento.sistemas1.service.PesquisadorService;

@RestController
@RequestMapping("/pesquisador")
public class PesquisadorController {

    private final PesquisadorRepository pesquisadorRepository;
    private final PesquisadorService pesquisadorService;
    private final ContagemService contagemService;

    public PesquisadorController(PesquisadorRepository pesquisadorRepository, PesquisadorService pesquisadorService,
            ContagemService contagemService) {
        this.pesquisadorRepository = pesquisadorRepository;
        this.pesquisadorService = pesquisadorService;
        this.contagemService = contagemService;
    }

    @GetMapping("/exibir")
    public List<Pesquisador> exibir() {
        return pesquisadorRepository.findAll();
    }

    /** Importa o pesquisador (e suas producoes) a partir do XML do Lattes. */
    @PostMapping("/incluir")
    public ResponseEntity<ImportacaoResultado> incluir(@RequestBody PesquisadorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pesquisadorService.importar(request));
    }

    @DeleteMapping("/excluir/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        pesquisadorService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    /** Arestas do grafo de pesquisadores. Parametro opcional: tipoIds=10,12 (vazio = todos). */
    @GetMapping("/contarTrabalhosEntrePesquisadores")
    public List<ArestaDTO> contarTrabalhosEntrePesquisadores(
            @RequestParam(name = "tipoIds", required = false) List<Long> tipoIds) {
        return contagemService.contarTrabalhosEntrePesquisadores(tipoIds == null ? null : new HashSet<>(tipoIds));
    }
}
