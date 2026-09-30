package desenvolvimento.sistemas1.controller;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import desenvolvimento.sistemas1.model.Trabalho;
import desenvolvimento.sistemas1.repository.TrabalhoRepository;
import desenvolvimento.sistemas1.service.TrabalhoUtils;

@RestController
@RequestMapping("/trabalho")
public class TrabalhoController {

    private final TrabalhoRepository trabalhoRepository;

    public TrabalhoController(TrabalhoRepository trabalhoRepository) {
        this.trabalhoRepository = trabalhoRepository;
    }

    /** Trabalhos sem repeticao: o mesmo trabalho cadastrado por varios autores aparece uma unica vez. */
    @GetMapping("/exibir")
    public List<Trabalho> exibir() {
        List<Trabalho> unicos = new ArrayList<>();
        Set<String> chaves = new HashSet<>();
        for (Trabalho trabalho : trabalhoRepository.findAll()) {
            if (chaves.add(TrabalhoUtils.chave(trabalho))) {
                unicos.add(trabalho);
            }
        }
        return unicos;
    }

    /** Somente trabalhos que aparecem em mais de um pesquisador. */
    @GetMapping("/exibir/trabalhoscomuns")
    public List<Trabalho> exibirComuns() {
        Map<String, List<Trabalho>> grupos = new LinkedHashMap<>();
        for (Trabalho trabalho : trabalhoRepository.findAll()) {
            grupos.computeIfAbsent(TrabalhoUtils.chave(trabalho), k -> new ArrayList<>()).add(trabalho);
        }
        List<Trabalho> comuns = new ArrayList<>();
        grupos.values().stream().filter(grupo -> grupo.size() > 1).forEach(comuns::addAll);
        return comuns;
    }

    /** Todos os registros, um por (pesquisador, trabalho). */
    @GetMapping("/exibir/todos")
    public List<Trabalho> exibirTodos() {
        return trabalhoRepository.findAll();
    }
}
