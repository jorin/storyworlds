class CreateRelationships < ActiveRecord::Migration[6.0]
  def change
    create_table :relationships do |t|
      t.string :name
      t.string :inverse_name
      t.text :description
      t.references :character, null: false, foreign_key: true, index: true
      t.references :relatable, null: false, polymorphic: true
      t.references :creator, foreign_key: { to_table: :users }, index: true
      t.references :world, null: false, foreign_key: true, index: true
      t.bigint :starts
      t.bigint :ends

      t.timestamps
    end
  end
end
