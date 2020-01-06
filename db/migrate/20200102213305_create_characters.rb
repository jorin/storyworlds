class CreateCharacters < ActiveRecord::Migration[6.0]
  def change
    create_table :characters do |t|
      t.string :name
      t.text :description
      t.references :creator, foreign_key: { to_table: :users }, index: true
      t.references :world, null: false, foreign_key: true, index: true
      t.float :starts
      t.float :ends

      t.timestamps
    end

    create_table :participants do |t|
      t.belongs_to :character
      t.belongs_to :event
      t.timestamps
    end
  end
end
