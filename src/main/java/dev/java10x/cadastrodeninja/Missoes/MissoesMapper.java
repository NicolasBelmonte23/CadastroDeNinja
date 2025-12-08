package dev.java10x.cadastrodeninja.Missoes;

public class MissoesMapper {

    public MissoesModel map(MissoesDTO missoesDTO) {

        MissoesModel missoesModel = new MissoesModel();
        missoesModel.setId(missoesDTO.getId());
        missoesModel.setNome(missoesDTO.getNome());
        missoesModel.setRanking(missoesDTO.getRanking());
        missoesModel.setNinjas(missoesDTO.getNinjas());

        return  missoesModel;
    }

    public MissoesDTO map(MissoesModel missoesModel) {

        MissoesDTO missoesDTO = new MissoesDTO();
        missoesDTO.setId(missoesModel.getId());
        missoesDTO.setNome(missoesModel.getNome());
        missoesDTO.setRanking(missoesModel.getRanking());
        missoesDTO.setNinjas(missoesModel.getNinjas());

        return missoesDTO;
    }


}
