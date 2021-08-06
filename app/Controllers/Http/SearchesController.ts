import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

/**
 * Controller responsável por realizar busca
 */
export default class SearchesController {

    /**
     * Recebe requisição get de busca
     */
    public search(ctx: HttpContextContract): Array<any> {
        return [];
    };
};