package dev.java10x.cadastrodeninja.Missoes;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MissoesService {


    private MissoesRepository missoesRepository;
    private MissoesMapper missoesMapper;

    public MissoesService(MissoesRepository missoesRepository , MissoesMapper missoesMapper) {
        this.missoesRepository = missoesRepository;
        this.missoesMapper = missoesMapper;
    }

    //LISTAR TODOS as missoes
    public List<MissoesDTO> listaMissoes(){
        List<MissoesModel> missoesModels = missoesRepository.findAll();
        return missoesModels.stream()
                .map(missoesMapper :: map)
                .collect(Collectors.toList());
    }

    //Listar ninjas por id
    public MissoesDTO listarMissoesId(Long id){
        Optional<MissoesModel> missoesId = missoesRepository.findById(id);
        return missoesId.map(missoesMapper :: map).orElse(null);
    }

    //Adicionar ninjas na tabela
    public  MissoesDTO criarMissoes(MissoesDTO missoesDTO){
        MissoesModel missoes = new MissoesModel();
        missoes = missoesRepository.save(missoes);
        return missoesMapper.map(missoes);
    }

    //Deleter missao - nao precisa de corpo
    public void deletarMissoesId(Long id){
        missoesRepository.deleteById(id);
    }

    //Atualizar a missao
     public MissoesDTO atualizarMissoes(Long id, MissoesDTO missoesDTO) {
         Optional<MissoesModel> missoes = missoesRepository.findById(id);
         if (missoes.isPresent()) {
             MissoesModel missoesModel = missoesMapper.map(missoesDTO);
             missoesModel.setId(id);
             MissoesModel missoesSalvo = missoesRepository.save(missoesModel);
             return missoesMapper.map(missoesSalvo);
         }
         return null;
     }

}
