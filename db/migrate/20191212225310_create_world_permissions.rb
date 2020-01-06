class CreateWorldPermissions < ActiveRecord::Migration[6.0]
  def change
    create_table :world_permissions do |t|
      t.string :permission, null: false
      t.references :user, null: false, foreign_key: true
      t.references :world, null: false, foreign_key: true
    end
  end
end
