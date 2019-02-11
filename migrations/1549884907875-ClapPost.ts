import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClapPost1549884907875 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "clap" ("id" SERIAL NOT NULL, "postId" integer NOT NULL, CONSTRAINT "PK_a9e56359c6a55b0b983b1b73c85" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "clap" ADD CONSTRAINT "FK_468a9486c2d3b69b30b6288bad3" FOREIGN KEY ("postId") REFERENCES "post"("id")`
    );
  }

  public async down (queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "clap" DROP CONSTRAINT "FK_468a9486c2d3b69b30b6288bad3"`
    );
    await queryRunner.query(`DROP TABLE "clap"`);
  }
}
