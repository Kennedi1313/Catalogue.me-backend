import {Request, Response} from 'express';
import Knex from 'knex';
import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHoursToMinutes';

export default class ItemsController {
    async index(request: Request, response: Response) {
        const filters = request.query;

        const shop_id = filters.shop_id as string;
        const week_day = filters.week_day as string;
        const time = filters.time as string;
        //const type = filters.type as string;
        var items: any;

        if(week_day && time) {
            const timeInMinutes = convertHourToMinutes(time);
            items = await db('items')
            .whereExists(function() {
                this.select('schedule.*')
                .from('schedule')
                .whereRaw('`schedule`.`item_id` = `items`.`id`')
                .whereRaw('`schedule`.`week_day` = ??', [Number(week_day)])
                .whereRaw('`schedule`.`to` > ??', [timeInMinutes])
                .whereRaw('`schedule`.`from` <= ??', [timeInMinutes])
            })
            .where('items.shop_id', '=', shop_id)
            .join('shops', 'items.shop_id', '=', 'shops.id')
            .select(['shops.*', 'items.*'])
        } else if(week_day) {
            items = await db('items')
            .whereExists(function() {
                this.select('schedule.*')
                .from('schedule')
                .whereRaw('`schedule`.`item_id` = `items`.`id`')
                .whereRaw('`schedule`.`week_day` = ??', [Number(week_day)])
            })
            .where('items.shop_id', '=', shop_id)
            .join('shops', 'items.shop_id', '=', 'shops.id')
            .select(['shops.*', 'items.*'])
        } else if(time) {
            const timeInMinutes = convertHourToMinutes(time);
            items = await db('items')
            .whereExists(function() {
                this.select('schedule.*')
                .from('schedule')
                .whereRaw('`schedule`.`item_id` = `items`.`id`')
                .whereRaw('`schedule`.`to` > ??', [timeInMinutes])
                .whereRaw('`schedule`.`from` <= ??', [timeInMinutes])
            }) 
            .where('items.shop_id', '=', shop_id)
            .join('shops', 'items.shop_id', '=', 'shops.id')
            .select(['shops.*', 'items.*'])
        } else {
            items = await db('items')
            .where('items.shop_id', '=', shop_id)
            //.andWhere('items.type', '=', type)
            .join('shops', 'items.shop_id', '=', 'shops.id')
            .select(['shops.*', 'items.*'])
        }

        return response.send(items);
    }

    async findByShop(request: Request, response: Response){
        const filters = request.query;
        const shop_id = filters.shop_id as string;
        const name = !!filters.name ? filters.name as string : '';
        const items = await db('items')
        .where('items.shop_id', '=', shop_id)
        .andWhere('items.name', 'like', '%' + name + '%')
        .join('shops', 'items.shop_id', '=', 'shops.id')
        .select(['items.*'])

        return response.send(items);
    }

    async findById(request: Request, response: Response){
        const filters = request.query;
        const item_id = filters.item_id as string
        const items = await db('items').where({id: item_id})
        return response.send(items);
    }

    async create(request: Request, response: Response) {
        const trx = await db.transaction();
    
        const {
            name,
            price,
            info,
            category,
            user_id
        } = request.body;

        var avatar = ''
        if(request.file)
             avatar = request.file.path;

        const shops = await trx('shops')
            .where('shops.user_id', '=', user_id)
            .select(['shops.id'])
        
        const shop_id = shops[0].id

            console.log({
                name,
                price, 
                avatar,
                info,
                category,
                shop_id
            })
    
        try {
            
            const insertedItemsIds = await trx('items').insert({
                name,
                price, 
                avatar,
                info,
                category,
                shop_id: shop_id
            });

            console.log({insertedItemsIds})

            await trx.commit();
            return response.status(201).send();
        } catch (err) {
            await trx.rollback();
            return response.status(400).json({
                error: "Unexpected error while creating a new item.",
                err
            })
        }
    }
}