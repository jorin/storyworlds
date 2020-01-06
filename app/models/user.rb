class User < ApplicationRecord
  # has_many :creations, class_name: :World, foreign_key: :creator_id
  has_many :created_worlds, class_name: :World, foreign_key: :creator_id
  has_many :world_permissions, dependent: :destroy, inverse_of: :user
  has_many :permitted_worlds, source: :world, through: :world_permissions
  has_secure_password

  accepts_nested_attributes_for :world_permissions, allow_destroy: true

  validates :email, presence: true, uniqueness: true
  validates :first_name, presence: true
  validates :last_name, presence: true

  def world_permission(world)
    if world.creator_id == id
      WorldPermission::PERMISSION_MANAGE
    else
      world_permissions.find_by(world_id: world.id)&.permission
    end
  end
end
