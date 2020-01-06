class AddCreatorIdPublicToWorlds < ActiveRecord::Migration[6.0]
  def change
    add_reference :worlds, :creator, foreign_key: { to_table: :users }
    add_column :worlds, :open, :boolean
  end
end
