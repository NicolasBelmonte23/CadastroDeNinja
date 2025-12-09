package dev.java10x.cadastrodeninja.Missoes;

import com.fasterxml.jackson.annotation.JsonIgnore;
import dev.java10x.cadastrodeninja.Ninjas.NinjaModel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class MissoesDTO {

    private Long id;

    private String nome;

    private String ranking;

    private List<NinjaModel> ninjas;


}
