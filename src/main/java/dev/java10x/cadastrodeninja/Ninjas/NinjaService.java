package dev.java10x.cadastrodeninja.Ninjas;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NinjaService {

    private NinjaRepository ninjaRepository;
    private NinjaMapper ninjaMapper;

    public NinjaService(NinjaRepository ninjaRepository, NinjaMapper ninjaMapper) {
        this.ninjaRepository = ninjaRepository;
        this.ninjaMapper = ninjaMapper;
    }

    //LISTAR TODOS OS NINJAS
    public List<NinjaDTO> listarNinjas() {
        List<NinjaModel> ninjas = ninjaRepository.findAll();
        return ninjas.stream()
                .map(ninjaMapper::map)
                .collect(Collectors.toList());
    }

    //Listar todos os ninjas por ID
    public NinjaDTO listarNinjaId(Long id){
        Optional<NinjaModel> ninjaId = ninjaRepository.findById(id);
        return ninjaId.map(ninjaMapper :: map).orElse(null);
    }

    //Criar ninjas na tabela
    public NinjaDTO criarNinja(NinjaDTO ninjaDTO) {
        NinjaModel ninja = ninjaMapper.map(ninjaDTO);
        ninja = ninjaRepository.save(ninja);
        return ninjaMapper.map(ninja);
    }

    //Deletar o ninja - tem que ser um metodo void
    public void deletarNinjaId(Long id){
        ninjaRepository.deleteById(id);
    }

    //Atualizar o ninja
    public NinjaDTO atualizarNinja(Long id, NinjaDTO ninjaDTO){
        Optional<NinjaModel> ninja = ninjaRepository.findById(id);
        if(ninja.isPresent()){
            NinjaModel ninjasAtualizado = ninjaMapper.map(ninjaDTO);
            ninjasAtualizado.setId(id);
            NinjaModel ninjaSalvo = ninjaRepository.save(ninjasAtualizado);
            return ninjaMapper.map(ninjaSalvo);
        }
        return null;
    }

}
