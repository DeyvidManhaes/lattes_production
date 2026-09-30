package desenvolvimento.sistemas1.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Pesquisador {
    
    @Id
    private Long id;
    private String nome;
    private String email;
    @ManyToOne
    private Instituto instituto; 

   public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getNome() {
        return nome;
    }
    public void setNome(String nome) {
        this.nome = nome;
    }
    
    public Instituto getInstituto() {
        return instituto;
    }
    public void setInstituto(Instituto instituto) {
        this.instituto = instituto;
    }
    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        result = prime * result + ((nome == null) ? 0 : nome.hashCode());
        result = prime * result + ((instituto == null) ? 0 : instituto.hashCode());
        return result;
    }

    
    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        Pesquisador other = (Pesquisador) obj;
        if (id == null) {
            if (other.id != null)
                return false;
        } else if (!id.equals(other.id))
            return false;
        if (nome == null) {
            if (other.nome != null)
                return false;
        } else if (!nome.equals(other.nome))
            return false;
        if (instituto == null) {
            if (other.instituto != null)
                return false;
        } else if (!instituto.equals(other.instituto))
            return false;
        return true;
    }
    @Override
    public String toString() {
        return "Pesquisador [id=" + id + ", nome=" + nome + ", instituto=" + instituto +
                "]";
    }
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    
    
}
