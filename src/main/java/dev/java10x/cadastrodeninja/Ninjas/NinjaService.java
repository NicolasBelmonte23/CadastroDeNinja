package dev.java10x.cadastrodeninja.Ninjas;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NinjaService {

    private NinjaRepository ninjaRepository;
    private NinjaMapper ninjaMapper;

    public NinjaService(NinjaRepository ninjaRepository, NinjaMapper ninjaMapper) {
        this.ninjaRepository = ninjaRepository;
        this.ninjaMapper = ninjaMapper;
    }

    //LISTAR TODOS OS NINJAS
    public List<NinjaModel> listarNinjas() {
        return ninjaRepository.findAll();

    }

    //Listar todos os ninjas por ID
    public NinjaModel listarNinjaId(Long id){
        Optional<NinjaModel> ninjaId = ninjaRepository.findById(id);
        return ninjaId.orElse(null);
    }

    //Adiconar ninjas na tabela
    public NinjaDTO criarNinja(NinjaDTO ninjaDTO){
        NinjaModel ninja = new NinjaMapper().map(ninjaDTO);
        ninja = ninjaRepository.save(ninja);
        return ninjaMapper.mDefinições
        Sair do modo tela cheia (fullscreen)



        29:54
        PIP

        ap(ninja);
    }

    //Deletar o ninja - tem que ser um metodo void
    public void deletarNinjaId(Long id){
        ninjaRepository.deleteById(id);
    }

    //Atualizar o ninja
    public NinjaModel atualizarNinja(Long id, NinjaModel ninjaAtualizado){
        if(ninjaRepository.existsById(id)){
            return ninjaRepository.save(ninjaAtualizado);
        }
        return null;
    }

}
