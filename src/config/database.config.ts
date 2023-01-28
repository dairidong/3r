import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const database = (): TypeOrmModuleOptions => ({
    charset: 'utf8mb4',
    logging: ['error'],
    type: 'mysql',
    host: '127.0.0.1',
    username: 'root',
    password: 'root',
    database: '3r',
    synchronize: true,
    autoLoadEntities: true,
});
