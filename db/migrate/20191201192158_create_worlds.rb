class CreateWorlds < ActiveRecord::Migration[6.0]
  def change
    create_table :worlds do |t|
      t.string :name
      t.string :slug, null: false
      t.text :description

      t.timestamps
    end

    add_index :worlds, :slug, unique: true
  end
end
