import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStockQuantityToMaterials1756042753060
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'material',
      new TableColumn({
        name: 'stock_quantity',
        type: 'integer',
        isNullable: false,
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('material', 'stock_quantity');
  }
}
