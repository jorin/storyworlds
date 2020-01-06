class AddTimelineUnitsToWorlds < ActiveRecord::Migration[6.0]
  def change
    add_column :worlds, :timeline_units, :string
  end
end
