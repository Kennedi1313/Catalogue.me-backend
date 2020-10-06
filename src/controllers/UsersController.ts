import {Request, Response} from 'express';
import db from '../database/index';
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

export default class UsersController {
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
            user_email,
            user_passwd
        } = request.body;

        try {

            const user_passwd_decrypted = criptografar(user_passwd);
            const user = await trx('users')
                .where('users.email', '=', user_email)
                .andWhere('users.passwd', '=', user_passwd_decrypted)
                .join('shops', 'shops.user_id' , '=', 'users.id')
                .select(['users.*', 'shops.id as shop_id'])
            console.log(user)
            if(user.length < 1) {
                return response.status(401).send({ error: "Falha na autenticação. "})
            }
            const jwt_key = "segredo";
            const token = jwt.sign({
                    user_email: user[0].email,
                    user_name: user[0].name,
                }, 
                jwt_key,
                {
                    expiresIn: "1h"
                } );
                
            trx.commit();
            return response.status(201).send({
                user: user[0], 
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