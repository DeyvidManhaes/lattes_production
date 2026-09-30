package desenvolvimento.sistemas1.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import desenvolvimento.sistemas1.model.Tipo;
import desenvolvimento.sistemas1.repository.TipoRepository;

@RestController
@RequestMapping("/tipo")
public class TipoController {

    private final TipoRepository tipoRepository;

    public TipoController(TipoRepository tipoRepository) {
        this.tipoRepository = tipoRepository;
    }

    @GetMapping("/exibir")
    public List<Tipo> exibir() {
        return tipoRepository.findAll();
    }
}
