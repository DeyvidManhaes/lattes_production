package desenvolvimento.sistemas1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import desenvolvimento.sistemas1.model.Pesquisador;

@Repository
public interface PesquisadorRepository extends JpaRepository<Pesquisador, Long> {

    boolean existsByInstitutoId(Long institutoId);
}
