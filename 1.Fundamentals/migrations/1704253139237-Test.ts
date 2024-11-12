import { MigrationInterface, QueryRunner } from 'typeorm';

export class Test1704253139237 implements MigrationInterface {
  name = 'Test1704253139237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "coffee" ADD "test" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "coffee" DROP COLUMN "test"`);
  }
}
