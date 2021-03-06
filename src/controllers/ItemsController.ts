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

        // @ts-ignore
        avatars.forEach(({avatar}) => {

            let key
            if(avatar.substring(0, url_s3.length) === url_s3)
                key = avatar.substring(url_s3.length, avatar.length);
            if(avatar.substring(0, url_s32.length) === url_s32)
                key = avatar.substring(url_s32.length, avatar.length);

            const deletado = s3.deleteObject({
                Bucket: 'upload-catalogueme',
                Key: key,
            });

        });
        
        const itemdeletado = await db('items').delete().where('items.id', item_id)

        return response.status(200).send();
    }
    async index(request: Request, response: Response) {
        const filters = request.query;
        const shop_id = filters.shop_id as string;
        const name = !!filters.name ? filters.name as string : '';
        const category = filters.category as string;
        const price = filters.price as string;
        const pagina = filters.page as string;
        const limite = filters.limit as string;
        const salto = (parseInt(pagina) - 1) * parseInt(limite);

        let items = db.select(['items.*', 'items.category'])
            .from('items')
            .where('items.shop_id', '=', shop_id)
            .andWhere('items.name', 'ilike', '%' + name + '%')
            .join('shops', 'items.shop_id', '=', 'shops.id')
            .limit(parseInt(limite))
            .offset(salto)
            .orderBy('items.name', 'asc')
        if(category && category !== 'all')
            items = items.where('items.category', category)
        if(price && price !== 'all')
            items = items.orderBy('items.price', price)

        var categories: string[] = []
        items.then(function (result) {
            result.forEach(element => {
                categories.push(element.category);
            })
            categories = categories.filter(function(este, i) {
                return categories.indexOf(este) === i;
            });
            
            response.status(200);
  
            return response.json({items: result, categories})
        }).catch(function (err) {
            return response.status(400).json(err);
        });
    }

    async findByShop(request: Request, response: Response){
        const filters = request.query;
        const shop_id = filters.shop_id as string;
        const name = !!filters.name ? filters.name as string : '';
        const category = filters.category as string;
        const price = filters.price as string;
        const pagina = filters.page as string;
        const limite = filters.limit as string;
        const salto = (parseInt(pagina) - 1) * parseInt(limite);

        let items = db.select(['items.*'])
            .from('items')
            .where('items.shop_id', '=', shop_id)
            .andWhere('items.name', 'ilike', '%' + name + '%')
            .join('shops', 'items.shop_id', '=', 'shops.id')
            .limit(parseInt(limite))
            .where('items.ativo', true)
            .offset(salto)
        if(category && category !== 'all')
            items = items.where('items.category', category)
        if(price && price !== 'all')
            items = items.orderBy('items.price', price)

        let total = db.count('items.id')
                                .from('items')
                                    .where('items.shop_id', '=', shop_id)
                                    .andWhere('items.name', 'ilike', '%' + name + '%')
                                    .andWhere('ativo', '=', true)
                                    .join('shops', 'items.shop_id', '=', 'shops.id')
                                if(category && category !== 'all')
                                    total = total.where('items.category', category)

        var totalItens = (await total)[0]['count']
        items.then(function (result) {            
            response.status(200);
            response.setHeader('x-content-length', totalItens.toString());

            return response.json({items: result, totalItens})
        }).catch(function (err) {
            return response.status(400).json(err);
        });
    }

    async findCategoriesByShop(request: Request, response: Response) {
        const filters = request.query;
        const shop_id = filters.shop_id as string;
        let query = db.select('items.category').from('items').where('items.shop_id', '=', shop_id).andWhere('items.ativo', '=', true)
        var categories: string[] = []
        
        query.then(function (result) {
            result.forEach(element => {
                
                categories.push(element.category);
            });
            
            categories = categories.filter(function(este, i) {
                return categories.indexOf(este) === i;
            });
          
            return response.status(200).send(categories)
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

        let items = db.select(['items.*', 'items.category', db.raw('(select "items-avatar".avatar from "items-avatar" where items.id = "items-avatar".item_id limit 1 )')])
            .from('items')
            .where('items.shop_id', '=', shop_id)
            .andWhere('items.name', 'ilike', '%' + name + '%')
            .andWhere('ativo', '=', false)
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
        let itemsAvatar = await db.select('items-avatar.*')
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
            user_id,
            options
        } = request.body;

        const optionsArray = JSON.parse(options);

        console.log(options)

        console.log(optionsArray)
       
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

            const insertedItemsIds = await trx('items').insert([{
                name,
                price, 
                info,
                ativo: true,
                category,
                avatar,
                shop_id: shop_id
            }], "id");

            const insertedItemsAvatarIds = await trx('items-avatar').insert([{
                avatar,
                item_id: insertedItemsIds[0]
            }], "id");

            const optionsFields = optionsArray.map( ({label}: { label: string}) => {
                if(label !== '') {
                    return { label: label, item_id: insertedItemsIds[0] } 
                }
            })

            const insertedItemOptions = await trx('items-options').insert(optionsFields, "id");
           
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

    async edit(request: Request, response: Response) {

        const trx = await db.transaction();
    
        const {
            item_id,
            name,
            price,
            info,
            category,
            user_id
        } = request.body;

        const shops = await trx('shops')
            .where('shops.user_id', '=', user_id)
            .select(['shops.id'])
        
        const shop_id = shops[0].id

        try {

            const res = await trx('items').where('id', item_id).update({
                name,
                price, 
                info,
                ativo: true,
                category,
                shop_id: shop_id
            });

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
      
        if(avatar === '') {
            return response.status(400).json({
                error: "Unexpected error while creating the avatar of a item.",
            })
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

    async changeAvatar(request: Request, response: Response) {
        const trx = await db.transaction();
    
        const {
            avatar,
            item_id
        } = request.body;

        try {
            
            await trx('items').where('id', item_id).update({
                avatar,
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

    async deleteAvatar(request: Request, response: Response) {
        const trx = await db.transaction();
    
        const {
            id,
            avatar
        } = request.body;

        try {

            const s3 = new aws.S3();
            const url_s3 = "https://upload-catalogueme.s3.amazonaws.com/";
            const url_s32 = "https://upload-catalogueme.s3.sa-east-1.amazonaws.com/"

            let key
            if(avatar.substring(0, url_s3.length) === url_s3)
                key = avatar.substring(url_s3.length, avatar.length);
            if(avatar.substring(0, url_s32.length) === url_s32)
                key = avatar.substring(url_s32.length, avatar.length);

            s3.deleteObject({
                Bucket: 'upload-catalogueme',
                Key: key,
            });
           
            await trx('items-avatar').where('id', id).delete();

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

            let updatedItemsIds;
          
            if(item.ativo) {
                updatedItemsIds = await trx('items')
                    .update({ativo: false})
                    .where('items.id','=', item.id);
               
            }else {
                updatedItemsIds = await trx('items')
                .update({ativo: true})
                .where('items.id','=', item.id);
               
            }
            

            await trx.commit();
            return response.status(201).send();
        } catch (err) {
    
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

            const updatedItemsIds = await trx('items')
                .update({ativo: true})
                .where('items.id','=', item.id);

            await trx.commit();
            return response.status(201).send();
        } catch (err) {
            await trx.rollback();
            return response.status(400).json({
                error: "Unexpected error while updating a item.",
                err
            })
        }
    }

    async findOptionsById(request: Request, response: Response) {
        const filters = request.query;
        const item_id = filters.item_id as string
        let itemsOptions = await db.select('items-options.*')
        .from('items-options')
        .where({item_id})
        console.log(item_id)
        console.log(itemsOptions)
        return response.status(200).json({itemsOptions});

    }
    
    async addItemOption(request: Request, response: Response) {
        const trx = await db.transaction();
    
        const {
            item_id,
            options_label
        } = request.body;

        const optionsFields =  { label: options_label, item_id: item_id } 

        try {
            const insertedItemOptions = await trx('items-options').insert(optionsFields, "id");
        
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

    async deleteItemOption(request: Request, response: Response) {
        const trx = await db.transaction();
    
        const {
            item_id,
            options_label
        } = request.body;

        console.log(item_id, options_label)

        try {
            const insertedItemOptions = await trx('items-options')
                .delete()    
                .where('item_id', item_id)
                .andWhere('label', options_label)

            console.log("deletou")
        
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