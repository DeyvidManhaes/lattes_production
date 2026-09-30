package desenvolvimento.sistemas1.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import desenvolvimento.sistemas1.model.Trabalho;

@Repository
public interface TrabalhoRepository extends JpaRepository<Trabalho, Long> {

    List<Trabalho> findByPesquisadorId(Long pesquisadorId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from Trabalho t where t.pesquisador.id = :pesquisadorId")
    void apagarPorPesquisadorId(@Param("pesquisadorId") Long pesquisadorId);
}
