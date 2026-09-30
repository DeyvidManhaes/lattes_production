package desenvolvimento.sistemas1.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import desenvolvimento.sistemas1.model.Tipo;
import desenvolvimento.sistemas1.repository.TipoRepository;

/** Garante que os tipos de producao existam, sem depender de ids fixos no banco. */
@Component
public class DataInitializer implements CommandLineRunner {

    private final TipoRepository tipoRepository;

    public DataInitializer(TipoRepository tipoRepository) {
        this.tipoRepository = tipoRepository;
    }

    @Override
    public void run(String... args) {
        for (String nome : List.of(Tipo.ARTIGO_PUBLICADO, Tipo.LIVRO_PUBLICADO)) {
            if (tipoRepository.findFirstByNomeOrderByIdAsc(nome).isEmpty()) {
                Tipo tipo = new Tipo();
                tipo.setNome(nome);
                tipoRepository.save(tipo);
            }
        }
    }
}
