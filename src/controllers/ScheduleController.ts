import {Request, Response} from 'express';
import db from '../database/index';

export default class ScheduleController {
    async findByShop(request: Request, response: Response){
        const filters = request.query;
        const shop_id = filters.shop_id as string;
        const schedule = await db('schedule')
        .where('schedule.shop_id', '=', shop_id)
        .join('shops', 'schedule.shop_id', '=', 'shops.id')
        .select(['schedule.*'])

        return response.send(schedule);
    }
}