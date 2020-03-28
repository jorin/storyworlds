class ChangeTimestampsToBigInt < ActiveRecord::Migration[6.0]
  def change
    change_column :characters, :starts, :bigint
    change_column :characters, :ends, :bigint

    change_column :events, :starts, :bigint
    change_column :events, :ends, :bigint

    change_column :locations, :starts, :bigint
    change_column :locations, :ends, :bigint
  end
end
