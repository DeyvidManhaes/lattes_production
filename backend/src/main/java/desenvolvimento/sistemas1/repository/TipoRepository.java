package desenvolvimento.sistemas1.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import desenvolvimento.sistemas1.model.Tipo;

@Repository
public interface TipoRepository extends JpaRepository<Tipo, Long> {

    Optional<Tipo> findFirstByNomeOrderByIdAsc(String nome);
}
