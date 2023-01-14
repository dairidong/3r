import { Exclude, Expose, Type } from 'class-transformer';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { PostBodyType } from '../constants';

@Exclude()
@Entity('content_posts')
export class PostEntity extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Expose()
    @Column({ comment: '文章标题' })
    title!: string;

    @Expose({ groups: ['post-detail'] })
    @Column({ comment: '文章内容', type: 'longtext' })
    body!: string;

    @Expose()
    @Column({ comment: '文章描述', nullable: true })
    sammary?: string;

    @Expose()
    @Column({ comment: '关键字', type: 'simple-array', nullable: true })
    keywords?: string[];

    @Expose()
    @Column({
        comment: '文章类型',
        type: 'enum',
        enum: PostBodyType,
        default: PostBodyType.MD,
    })
    type!: PostBodyType;

    @Expose()
    @Type(() => Date)
    @Column({
        comment: '发布时间',
        type: 'varchar',
        nullable: true,
    })
    publishedAt?: Date | null;

    @Expose()
    @Column({ comment: '文章排序', default: 0 })
    customOrder!: number;

    @Expose()
    @Type(() => Date)
    @CreateDateColumn({ comment: '创建时间' })
    createdAt!: Date;

    @Expose()
    @Type(() => Date)
    @UpdateDateColumn({ comment: '更新时间' })
    updatedAt!: Date;
}
