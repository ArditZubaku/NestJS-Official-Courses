import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Coffee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column('json', { nullable: true })
  flavours: string[];

  constructor(id: number, name: string, brand: string, flavours: string[]) {
    this.id = id;
    this.name = name;
    this.brand = brand;
    this.flavours = flavours;
  }
}
