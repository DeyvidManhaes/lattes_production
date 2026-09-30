package desenvolvimento.sistemas1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import desenvolvimento.sistemas1.model.Instituto;

@Repository
public interface InstitutoRepository extends JpaRepository<Instituto, Long> {

    boolean existsByNomeIgnoreCase(String nome);

    boolean existsByAcronimoIgnoreCase(String acronimo);
}
