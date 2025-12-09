package dev.java10x.cadastrodeninja.Ninjas;

import jakarta.persistence.PostUpdate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("ninjas")
public class NinjaController {

    private NinjaService ninjaService;
    public NinjaController(NinjaService ninjaService) {
        this.ninjaService = ninjaService;
    }

    @GetMapping("/boasVindas")
    public String boasVindass(){
        return "Essa é minha primeira mensagem nessa rota";
    }

    //Adicionar Ninja( CREATE)
    @PostMapping("/criar")
    public NinjaDTO criarNinja(@RequestBody NinjaDTO ninja){
        return ninjaService.criarNinja(ninja);
    }

    //Mostrar Ninjas por ID (READ)
    @GetMapping("/listar/{id}")
    public NinjaDTO listarNinjaId(@PathVariable Long id){
        return ninjaService.listarNinjaId(id);
    }

    //Mostrar todos os ninjas (READ)
    @GetMapping("/listar")
    public List<NinjaDTO> listarNinjas(){
        return  ninjaService.listarNinjas();
    }

    //Alterar dados dos Ninjas (UPDATE)
    @PutMapping("/alterar/{id}")
    public NinjaDTO updateNinjaid(@PathVariable Long id, @RequestBody NinjaDTO ninjaAtualizado){
        return ninjaService.atualizarNinja(id, ninjaAtualizado);
    }

    //Deletar Ninja (DELETE)
    @DeleteMapping("/deletar/{id}")
    public void deleteNinjaid(@PathVariable Long id){
        ninjaService.deletarNinjaId(id);
    }



}
