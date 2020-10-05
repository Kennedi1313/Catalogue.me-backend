import {Request, Response} from 'express';
import db from '../database/connection';
import crypto from 'crypto'
import convertHourToMinutes from '../utils/convertHoursToMinutes';

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
        const filters = request.query;
        const shop_id = filters.id as string
        var shops: any;

        shops = await db('shops')
        .where('shops.id', '=', shop_id)
        .select(['shops.*'])
        

        return response.send(shops);
    }

    async findById(request: Request, response: Response){
        const filters = request.query;
        const shop_id = filters.shop_id as string
        console.log(filters)
        const shop = await db('shops').where({id: shop_id}).select('shops.name')
        console.log(shop)
        return response.send(shop);
    }

    async create(request: Request, response: Response) {
        const trx = await db.transaction();
    
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

        const schedule = JSON.parse(schedule_JSON)

        const shop_avatar = request.file.path

        const user_passwd_encrypted = criptografar(user_passwd);
    
        try {
            const insertedUsersIds = await trx('users').insert({
                name: user_name, 
                whatsapp: user_whatsapp, 
                email: user_email, 
                passwd: user_passwd_encrypted
            })

            const user_id = insertedUsersIds[0];

            const insertedShopsIds = await trx('shops').insert({
                name: shop_name, 
                whatsapp: shop_whatsapp, 
                avatar: shop_avatar, 
                bio: shop_bio,
                user_id
            })

            const shop_id = insertedShopsIds[0]

            if(schedule) {
                const itemSchedule = schedule.map((scheduleItem: ScheduleItem) => {
                    return {
                        shop_id,
                        week_day: scheduleItem.week_day,
                        from: scheduleItem.from != '' ? convertHourToMinutes(scheduleItem.from) : convertHourToMinutes('00:00'),
                        to: scheduleItem.to != '' ? convertHourToMinutes(scheduleItem.to) : convertHourToMinutes('23:59'),
                    };
                })
                await trx('schedule').insert(itemSchedule);
            }

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
}