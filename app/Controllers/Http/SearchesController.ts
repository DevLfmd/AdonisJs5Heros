import Env from '@ioc:Adonis/Core/Env';
import Redis from '@ioc:Adonis/Addons/Redis';

import axios from 'axios';

type IHero = { 
    id: number;
    name: string;
    slug: string;
    powerstats: {
        intelligence: number;
        strength: number;
        speed: number;
        durability: number;
        power: number;
        combat: number;
    },
    appearance: {
        gender: string;
        race: string;
        height: Array<string>,
        weight: Array<string>
        eyeColor: string;
        hairColor: string;
    },
    biography: {
        fullName: string;
        alterEgos: string;
        aliases: Array<string>,
        placeOfBirth: string;
        firstAppearance: string;
        publisher: string;
        alignment: string;
    },
    work: {
        occupation: string;
        base: string;
    },
    connections: {
        groupAffiliation: string;
        relatives: string;
    },
    images: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
    }
};

/**
 * Controller responsável por realizar busca
 */
export default class SearchesController {
    /**
     * Retona todos os herois na api externa
     */
    public async fetchHeros(): Promise<any> {
        return await axios.get(`${Env.get('SUPER_HERO_API')}/all.json`);
    };

    /**
     * Faz pesquisa nos dados
     * @param str 
     */
    public async execSearch(arr: Array<any>, q: string): Promise<Array<IHero>> {
        return (
            arr.filter((value) => (
                Object.keys(value).some((key) => (
                    JSON.stringify(value[key]).includes(q, 0) === true ? 
                        value : false
                ))
            ))
        );
    };

    /**
     * Recebe requisição get de busca
     */
    public async search({ request, response }): Promise<Array<IHero | []> | any> {
        const { q } = request.params();

        if(q.length < 3)
            return response.status(400);

        const heros = await Redis.get('heros');

        // Faremos essa verificação para
        // caso o nosso cache não estiver inicializado.
        if(heros !== null) {
            const req = await this.fetchHeros();
            
            if(req.data)
                await Redis.set('heros', JSON.stringify(req.data));
            else
                return response.status(500);
        };

        const heros_cache: string | null = await Redis.get('heros');
        if(heros_cache) {
            const schema_parsed = JSON.parse(heros_cache);
            const search = await this.execSearch(schema_parsed, q);
            
            return response.send(search);
        };
  
        return response.send([]);
    };
};