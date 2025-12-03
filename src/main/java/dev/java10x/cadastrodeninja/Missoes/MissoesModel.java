package dev.java10x.cadastrodeninja.Missoes;

import com.fasterxml.jackson.annotation.JsonIgnore;
import dev.java10x.cadastrodeninja.Ninjas.NinjaModel;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "tb_missao")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class MissoesModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String ranking;

    // Uma missao pode ter varios ninjas
    @OneToMany(mappedBy = "missoes")
    @JsonIgnore
    private List<NinjaModel> ninjas;


}
