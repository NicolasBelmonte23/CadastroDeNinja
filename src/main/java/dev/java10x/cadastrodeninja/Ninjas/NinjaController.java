package dev.java10x.cadastrodeninja.Ninjas;

import jakarta.persistence.PostUpdate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("ninjas")
public class NinjaController {

    @GetMapping("/boasVindas")
    public String boasVindass(){
        return "Essa é minha primeira mensagem nessa rota";
    }

    //Adicionar Ninja( CREATE)
    @PostMapping("/criar")
    public String criarNinja(){
        return "Ninja criado";
    }

    //Mostrar Ninjas por ID (READ)
    @GetMapping("/listarID")
    public String todosNinjasId(){
        return "Todos os ninjas";
    }

    //Mostrar todos os ninjas (READ)
    @GetMapping("/listar")
    public String todosNinjas(){
        return "Todos os ninjas";
    }

    //Alterar dados dos Ninjas (UPDATE)
    @PutMapping("/alterarID")
    public String updateNinjaid(){
        return "Alterar Ninja por ID";
    }

    //Deletar Ninja (DELETE)
    @DeleteMapping("/deletarID")
    public String deleteNinjaid(){
        return "Deletar Ninja por ID";
    }

}
