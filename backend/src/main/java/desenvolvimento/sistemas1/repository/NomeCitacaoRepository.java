package desenvolvimento.sistemas1.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import desenvolvimento.sistemas1.model.NomeCitacao;

@Repository
public interface NomeCitacaoRepository extends JpaRepository<NomeCitacao, Long> {

    List<NomeCitacao> findByTrabalhoId(Long trabalhoId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from NomeCitacao n where n.trabalho.id in (select t.id from Trabalho t where t.pesquisador.id = :pesquisadorId)")
    void apagarPorPesquisadorId(@Param("pesquisadorId") Long pesquisadorId);
}
