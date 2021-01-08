import {Request, Response} from 'express';
import db from '../database';
import crypto from 'crypto'
import convertHourToMinutes from '../utils/convertHoursToMinutes';
import knex from 'knex';

interface ScheduleItem {
    week_day: number;
    from: string;
    to: string;
}

function criptografar(tobeEncrypted: string) {
    const secret = '1134';
    const key = crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0, 32);
    const iv = crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0, 16);

    const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
    const encrypted = cipher.update(String(tobeEncrypted), 'utf8', 'hex') + cipher.final('hex');
    
    return encrypted;  
};

export default class ShopsController {
    async index(request: Request, response: Response) {
        var shops: any;
        shops = await db('shops').whereNotIn('id', [3, 6, 7, 8, 11, 16])
        .select(['shops.*'])
        return response.send(shops);
    }

    async findById(request: Request, response: Response){
        const filters = request.query;
        const shop_id = filters.shop_id as string
        const shop = await db('shops').where({id: shop_id}).select('shops.name', 'shops.whatsapp', 'shops.tag', 'shops.bio', 'shops.logo')
        console.log(shop, shop_id)
        return response.send(shop);
    }

    async findByTag(request: Request, response: Response){
        const filters = request.query;
        const shop_tag = filters.shop_tag as string
        const shop = await db('shops').where({tag: shop_tag}).select('shops.name', 'shops.whatsapp', 'shops.id', 'shops.bio', 'shops.logo')
        return response.send(shop);
    }

    async create(request: Request, response: Response) {
        const trx = await db.transaction()
    
        const {
            user_name,
            user_whatsapp,
            user_email,
            user_passwd,
            shop_name,
            shop_whatsapp,
            shop_bio,
            schedule_JSON,
        } = request.body;

        var schedule = []
        if(schedule_JSON)
            schedule = JSON.parse(schedule_JSON)

        var shop_avatar = ''
        if(request.file)
            shop_avatar = request.file.path
    
        const user_passwd_encrypted = criptografar(user_passwd);

        try {
            const user_ids_cadastrados = await trx('users').insert({
                name: user_name, 
                whatsapp: user_whatsapp, 
                email: user_email, 
                passwd: user_passwd_encrypted
            }, "id")

            const user_id = user_ids_cadastrados[0]

            let shop_tag = shop_name.normalize("NFD").replace(/[^a-zA-Zs]/g, "");
            shop_tag = shop_tag.replace(/\s/g, '');
            console.log(shop_tag)
            const shop_ids_cadastrados = await trx('shops').insert({
                name: shop_name, 
                whatsapp: shop_whatsapp, 
                avatar: shop_avatar, 
                bio: shop_bio,
                tag: shop_tag,
                user_id
            }, "id")

            const shop_id = shop_ids_cadastrados[0]

            await trx.commit();
            return response.status(201).send()
    
        } catch (err) {
            await trx.rollback();
            return response.status(400).json({
                error: "Unexpected error while creating a new user or a new shop.",
                trace: err
            })
        }
    }
    async edit(request: Request, response: Response) {
        const trx = await db.transaction()
        console.log(request.body)
        const {
            shop_id,
            shop_name,
            shop_whatsapp,
            shop_bio,
        } = request.body;

        var shop_avatar = ''
        if(request.file)
            shop_avatar = request.file.path

        try {

            let shop_tag = shop_name.normalize("NFD").replace(/[^a-zA-Zs]/g, "");
            shop_tag = shop_tag.replace(/\s/g, '');

            await trx('shops').where('id', shop_id).update({
                name: shop_name, 
                whatsapp: shop_whatsapp, 
                logo: shop_avatar, 
                bio: shop_bio,
                tag: shop_tag,
            })

            await trx.commit();
            return response.status(201).send()
    
        } catch (err) {
            console.log(err)
            await trx.rollback();
            return response.status(400).json({
                error: "Unexpected error while creating a new user or a new shop.",
                trace: err
                
            })
        }
    }

    async addLogo(request: Request, response: Response) {
        const trx = await db.transaction();
    
        const {
            shop_id
        } = request.body;

        var logo = ''
        if(request.file){ 
            // @ts-ignore
            logo = request.file.path ? request.file.path : request.file.location;
        }

        if(logo === '') {
            return response.status(400).json({
                error: "Unexpected error while creating the avatar of a item.",
            })
        }
        try {
            
            await trx('shops').where('id', shop_id).update({
                logo
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
}