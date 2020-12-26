import {Request, Response} from 'express';
import db from '../database/index';
import convertHourToMinutes from '../utils/convertHoursToMinutes';
import aws from 'aws-sdk';

export default class ItemsController {
    async delete(request: Request, response: Response) {
        const { item_id, avatars } = request.body
        const s3 = new aws.S3();
        const url_s3 = "https://upload-catalogueme.s3.amazonaws.com/";
        const url_s32 = "https://upload-catalogueme.s3.sa-east-1.amazonaws.com/"
        console.log(avatars)
        // @ts-ignore
        avatars.forEach(({avatar}) => {
            console.log(avatar)
            let key
            if(avatar.substring(0, url_s3.length) === url_s3)
                key = avatar.substring(url_s3.length, avatar.length);
            if(avatar.substring(0, url_s32.length) === url_s32)
                key = avatar.substring(url_s32.length, avatar.length);
            console.log(key)
            const deletado = s3.deleteObject({
                Bucket: 'upload-catalogueme',
                Key: key,
            });

            console.log(deletado);
        });
        
        const itemdeletado = await db('items').delete().where('items.id', item_id)
        console.log(itemdeletado)
        return response.status(200).send();
    }
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
        const category = filters.category as string;
        const price = filters.price as string;

        console.log([filters])
        let items = db.select(['items.*', 'items.category', 'items-avatar.avatar'])
            .from('items')
            .where('items.shop_id', '=', shop_id)
            .andWhere('items.name', 'ilike', '%' + name + '%')
            .andWhere('ativo', '=', true)
            .join('items-avatar', 'items.id', '=', 'items-avatar.item_id')
            .join('shops', 'items.shop_id', '=', 'shops.id')
            
        if(category && category !== 'all')
            items = items.where('items.category', category)
        if(price)
            items = items.orderBy('items.price', price)

        var categories: string[] = []
        items.then(function (result) {
            result.forEach(element => {
                categories.push(element.category)
            })
            categories = categories.filter(function(este, i) {
                return categories.indexOf(este) === i;
            });
            console.log(result)
            return response.status(200).json({items: result, categories})
        }).catch(function (err) {
            return response.status(400).json(err);
        });
    }

    async findInativosByShop(request: Request, response: Response){
        const filters = request.query;
        const shop_id = filters.shop_id as string;
        const name = !!filters.name ? filters.name as string : '';
        const category = filters.category as string;
        const price = filters.price as string;

        let items = db.select(['items.*', 'items.category', 'items-avatar.avatar'])
            .from('items')
            .where('items.shop_id', '=', shop_id)
            .andWhere('items.name', 'ilike', '%' + name + '%')
            .andWhere('ativo', '=', false)
            .join('items-avatar', 'items.id', '=', 'items-avatar.item_id')
            .join('shops', 'items.shop_id', '=', 'shops.id')
            
        if(category && category !== 'all')
            items = items.where('items.category', category)
        if(price)
            items = items.orderBy('items.price', price)

        var categories: string[] = []
        items.then(function (result) {
            result.forEach(element => {
                categories.push(element.category)
            })
            categories = categories.filter(function(este, i) {
                return categories.indexOf(este) === i;
            });
            return response.status(200).json({items: result, categories})
        }).catch(function (err) {
            return response.status(400).json(err);
        });
    }

    async findById(request: Request, response: Response){
        const filters = request.query;
        const item_id = filters.item_id as string
        const items = await db.select('items.*')
        .from('items')
        .where({id: item_id})
        return response.send(items);
    }

    async findAvatarById(request: Request, response: Response){
        const filters = request.query;
        const item_id = filters.item_id as string
        let itemsAvatar = await db.select('items-avatar.avatar')
        .from('items-avatar')
        .where({item_id})
        return response.status(200).json({itemsAvatar});
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
        if(request.file){ 
            // @ts-ignore
            avatar = request.file.path ? request.file.path : request.file.location;
        }

        const shops = await trx('shops')
            .where('shops.user_id', '=', user_id)
            .select(['shops.id'])
        
        const shop_id = shops[0].id

        try {

            const insertedItemsIds = await trx('items').insert({
                name,
                price, 
                info,
                ativo: true,
                category,
                shop_id: shop_id
            }, "id");

            console.log(insertedItemsIds[0])

            const insertedItemsAvatarIds = await trx('items-avatar').insert({
                avatar,
                item_id: insertedItemsIds[0]
            }, "id");

            console.log(insertedItemsAvatarIds)

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

    async addAvatar(request: Request, response: Response) {
        const trx = await db.transaction();
    
        const {
            item_id
        } = request.body;

        var avatar = ''
        if(request.file){ 
            // @ts-ignore
            avatar = request.file.path ? request.file.path : request.file.location;
        }

        try {
            
            const insertedItemsAvatarIds = await trx('items-avatar').insert({
                avatar,
                item_id
            });

            await trx.commit();
            return response.status(201).send();
        } catch (err) {
            await trx.rollback();
            return response.status(400).json({
                error: "Unexpected error while creating the avatar of a item.",
                err
            })
        }
    }

    async inativar(request: Request, response: Response) {
        const trx = await db.transaction();
    
        const {
            item,
        } = request.body;

        try {
            
            console.log(item)

            const updatedItemsIds = await trx('items')
                .update({ativo: false})
                .where('items.id','=', item.id);

            console.log(updatedItemsIds)

            await trx.commit();
            return response.status(201).send();
        } catch (err) {
            console.log(err)
            await trx.rollback();
            return response.status(400).json({
                error: "Unexpected error while updating a item.",
                err
            })
        }
    }

    async ativar(request: Request, response: Response) {
        const trx = await db.transaction();
    
        const {
            item,
        } = request.body;

        try {
            
            console.log(item)

            const updatedItemsIds = await trx('items')
                .update({ativo: true})
                .where('items.id','=', item.id);

            console.log(updatedItemsIds)

            await trx.commit();
            return response.status(201).send();
        } catch (err) {
            console.log(err)
            await trx.rollback();
            return response.status(400).json({
                error: "Unexpected error while updating a item.",
                err
            })
        }
    }
}