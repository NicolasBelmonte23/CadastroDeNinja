package dev.java10x.cadastrodeninja.Missoes;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MissoesService {

    private MissoesRepository missoesRepository;

    public MissoesService(MissoesRepository missoesRepository) {
        this.missoesRepository = missoesRepository;
    }

    //LISTAR TODOS as missoes
    public List<MissoesModel> listaMissoes(){
        return missoesRepository.findAll();
    }

    //Listar ninjas por id
    public MissoesModel listarMissoesId(Long id){
        Optional<MissoesModel> missoesId = missoesRepository.findById(id);
        return missoesId.orElse(null);
    }

    //Adicionar ninjas na tabela
    public  MissoesModel criarMissoes(MissoesModel missoes){
        return missoesRepository.save(missoes);
    }

    //Deleter missao - nao precisa de corpo
    public void deletarMissoesId(Long id){
        missoesRepository.deleteById(id);
    }

    //Atualizar a missao
     public MissoesModel atualizarMissoes(Long id, MissoesModel missoesAtualizada){
        if(missoesRepository.existsById(id)){
            missoesAtualizada.setId(id);
            return missoesRepository.save(missoesAtualizada);
        }
        return null;

         }
}
