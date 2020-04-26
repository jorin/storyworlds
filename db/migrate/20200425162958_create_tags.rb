class CreateTags < ActiveRecord::Migration[6.0]
  def change
    create_table :tags do |t|
      t.string :name
      t.string :slug, null: false
      t.references :world, null: false, foreign_key: true

      t.timestamps
    end

    create_table :taggings do |t|
      t.references :tag, null: false, foreign_key: true
      t.references :tagged, null: false, polymorphic: true
    end
  end
end
