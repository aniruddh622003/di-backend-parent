import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  username: string;

  @Column()
  firstname: string;

  @Column({
    nullable: true,
  })
  middlename?: string;

  @Column()
  lastname: string;

  @Column({
    type: 'bigint',
  })
  aadhaar_number: number;

  @Column()
  hash: string;

  @Column()
  email: string;

  @Column({
    type: 'bigint',
  })
  phone: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  hashedRt?: string | null;

  constructor(user: Partial<User>) {
    Object.assign(this, user);
  }

  setHash(hash: string): User {
    this.hash = hash;
    return this;
  }
}
