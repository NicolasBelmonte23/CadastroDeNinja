package dev.java10x.cadastrodeninja.Ninjas;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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
    public ResponseEntity<String> criarNinja(@RequestBody NinjaDTO ninja){
        NinjaDTO ninjaNovo = ninjaService.criarNinja(ninja);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(" Ninja criado com sucesso " +  ninjaNovo.getNome() + " (ID)" +  ninjaNovo.getId());

    }

    //Mostrar Ninjas por ID (READ)
    @GetMapping("/listar/{id}")
    public ResponseEntity<?> listarNinjaId(@PathVariable Long id){
        NinjaDTO listId = ninjaService.listarNinjaId(id);
        if(listId != null){
            return  ResponseEntity.ok(listId);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ninja com ID " + id + " não existe nos nossos registros");

    }

    //Mostrar todos os ninjas (READ)
    @GetMapping("/listar")
    public ResponseEntity<List<NinjaDTO>> listarNinjas(){
        List<NinjaDTO> list = ninjaService.listarNinjas();
        return ResponseEntity.ok(list);

    }

    //Alterar dados dos Ninjas (UPDATE)
    @PutMapping("/alterar/{id}")
    public ResponseEntity<?> updateNinjaid(@PathVariable Long id, @RequestBody NinjaDTO ninjaAtualizado){
        NinjaDTO ninja = ninjaService.atualizarNinja(id, ninjaAtualizado);
        if(ninjaAtualizado != null){
            return ResponseEntity.ok(ninja);
        }else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ninja com esse id " + id + " não encontrado");
        }
    }

    //Deletar Ninja (DELETE)
    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<String> deleteNinjaid(@PathVariable Long id){

        if(ninjaService.listarNinjaId(id) !=null){
            ninjaService.deletarNinjaId(id);
            return ResponseEntity.ok("Ninja com ID" + id + " deletado com sucesso");
        }else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("O ninja com id" + id + " não encontrado");
        }
    }



}
