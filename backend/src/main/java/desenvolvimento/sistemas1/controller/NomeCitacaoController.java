package desenvolvimento.sistemas1.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import desenvolvimento.sistemas1.model.NomeCitacao;
import desenvolvimento.sistemas1.repository.NomeCitacaoRepository;

@RestController
@RequestMapping("/nome")
public class NomeCitacaoController {

    private final NomeCitacaoRepository nomeCitacaoRepository;

    public NomeCitacaoController(NomeCitacaoRepository nomeCitacaoRepository) {
        this.nomeCitacaoRepository = nomeCitacaoRepository;
    }

    @GetMapping("/exibir")
    public List<NomeCitacao> exibir() {
        return nomeCitacaoRepository.findAll();
    }
}
