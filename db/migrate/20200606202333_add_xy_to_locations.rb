class AddXyToLocations < ActiveRecord::Migration[6.0]
  def change
    add_column :locations, :coordinate_x, :float, precision: 10, scale: 6
    add_column :locations, :coordinate_y, :float, precision: 10, scale: 6
  end
end
