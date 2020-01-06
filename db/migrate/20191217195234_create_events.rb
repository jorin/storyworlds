class CreateEvents < ActiveRecord::Migration[6.0]
  def change
    create_table :events do |t|
      t.string :name
      t.text :description
      t.references :creator, foreign_key: { to_table: :users }, index: true
      t.references :location, null: false, foreign_key: true, index: true
      t.references :world, null: false, foreign_key: true, index: true
      t.float :starts
      t.float :ends

      t.timestamps
    end
  end
end
