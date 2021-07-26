import {Request, Response} from 'express';
import db from '../database/index';
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

    async findByShop(request: Request, response: Response){
        const filters = request.query;
        const shop_id = filters.shop_id as string;

        let items = db.select(['items.*'])
            .from('items')
            .where('items.shop_id', '=', shop_id)
            .join('shops', 'items.shop_id', '=', 'shops.id')
            .orderBy('items.name', 'asc')
            
        let total = db.count('items.id')
            .from('items')
            .where('items.shop_id', '=', shop_id)
            .join('shops', 'items.shop_id', '=', 'shops.id')
                            

        var totalItens = (await total)[0]['count']
        items.then(function (result) {            
            response.status(200);
            response.setHeader('x-content-length', totalItens.toString());

            return response.json({items: result, totalItens})
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

    async create(request: Request, response: Response) {

        const trx = await db.transaction();
    
        const {
            name,
            price,
            info,
            shop_id
        } = request.body;

        var avatar = ''
        if(request.file){ 
            // @ts-ignore
            avatar = request.file.path ? request.file.path : request.file.location;
        }
        
        try {

            const insertedItemsIds = await trx('items').insert([{
                name,
                price, 
                info,
                ativo: true,
                avatar,
                shop_id: shop_id
            }], "id");

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
            info
        } = request.body.params;

        try {

            const res = await trx('items').where('id', item_id).update({
                name,
                price, 
                info,
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

}