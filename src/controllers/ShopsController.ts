import {Request, Response} from 'express';
import db from '../database';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

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
        const shop = await db('shops').where({id: shop_id}).select('shops.name', 'shops.whatsapp', 'shops.id')
        return response.send(shop);
    }

    async findByTag(request: Request, response: Response){
        const filters = request.query;
        const shop_tag = filters.shop_tag as string
        const shop = await db.raw('select * from shops where REPLACE(name, \' \', \'\') = ? ', [shop_tag]);
        return response.send(shop);
    }

    async create(request: Request, response: Response) {
        const trx = await db.transaction()
    
        const {
            name,
            whatsapp,
            passwd
        } = request.body;
    
        const user_passwd_encrypted = criptografar(passwd);

        try {

            const shop_ids_cadastrados = await trx('shops').insert({
                name, 
                whatsapp, 
                passwd: user_passwd_encrypted
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
      
        const {
            id,
            name,
            whatsapp,
        } = request.body;

        try {

            await trx('shops').where('id', id).update({
                name, 
                whatsapp, 
            })

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

    async login(request: Request, response: Response) {
        const trx = await db.transaction();
        function criptografar(tobeEncrypted: string) {

            const secret = '1134';
            const key = crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0, 32);
            const iv = crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0, 16);
        
            const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
            const encrypted = cipher.update(String(tobeEncrypted), 'utf8', 'hex') + cipher.final('hex');
            
            return encrypted;  
        };

        const {
            whatsapp,
            passwd
        } = request.body;

        try {

            const user_passwd_decrypted = criptografar(passwd);
            const shop = await trx('shops')
                .where('shops.whatsapp', '=', whatsapp)
                .andWhere('shops.passwd', '=', user_passwd_decrypted)
                .join('shops', 'shops.user_id' , '=', 'users.id')
                .select('shops.*')
            if(shop.length < 1) {
                return response.status(401).send({ error: "Falha na autenticação. "})
            }
            const jwt_key = "segredo";
            const token = jwt.sign({
                    whatsapp: shop[0].whatsapp,
                    name: shop[0].name,
                }, 
                jwt_key,
                {
                    expiresIn: "1h"
                } );
                
            trx.commit();
            return response.status(201).send({
                shop: shop[0], 
                token: token,
                message: "Autenticado com sucesso."
            })
            
        } catch (err) {
            trx.rollback()
            return response.status(400).json({
                error: "Error on authentication.",
                trace: err
            })
        }
    }
}